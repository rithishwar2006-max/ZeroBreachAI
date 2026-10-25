from fastapi import APIRouter, HTTPException, BackgroundTasks, Request, UploadFile, File, Depends, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from ml.live_sniffer import sniffer_manager
import pandas as pd
import numpy as np
import joblib
import os
import time
import asyncio
from database import mongo_db, get_db
from sqlalchemy.orm import Session
from models.user import User, Role, AuditLog
from core.security import get_current_user, RequireRole
from datetime import datetime

router = APIRouter()

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'uploads'))
os.makedirs(UPLOAD_DIR, exist_ok=True)

import ipaddress

def is_local_or_private(ip_str: str) -> bool:
    try:
        raw_ip = str(ip_str).split(':')[0].strip('[]')
        ip_obj = ipaddress.ip_address(raw_ip)
        return ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_link_local or ip_obj.is_multicast or ip_obj.is_reserved
    except Exception:
        return False

# ==========================================
# ðŸ›¡ï¸ NetShield Context-Aware Risk Engine ðŸ›¡ï¸
# ==========================================

# Configurable Security Policy Weights
W_CONFIDENCE = 0.5
W_SEVERITY = 0.3
W_ASSET = 0.2

# NetShield Defined Attack Severity Policy
ATTACK_SEVERITY = {
    "Portscan": 0.30,
    "Botnet": 0.80,
    "FTP-Patator": 0.70,
    "SSH-Patator": 0.70,
    "DoS GoldenEye": 0.75,
    "DoS Hulk": 0.80,
    "DoS Slowhttptest": 0.75,
    "DoS Slowloris": 0.75,
    "DDoS": 0.90,
    "Infiltration": 1.00,
    "Web Attack": 0.95,
    "Heartbleed": 1.00,
    "BENIGN": 0.00
}

# Configured Asset Criticality Database (Simulated CMDB)
ASSET_DB = {
    "192.168.1.100": {"name": "Database Server", "criticality": 1.0},
    "192.168.1.101": {"name": "Domain Controller", "criticality": 1.0},
    "192.168.1.50": {"name": "Application Server", "criticality": 0.8}
}

def calculate_risk(prediction_label: str, confidence: float, dst_ip: str) -> dict:
    asset_info = ASSET_DB.get(dst_ip, {"name": "Unknown Endpoint", "criticality": 0.5})
    asset_criticality = asset_info["criticality"]
    asset_name = asset_info["name"]

    if prediction_label == "BENIGN":
        final_risk_score = min(30.0, round((1 - confidence) * 30, 2))
        severity = "Low"
        attack_severity_weight = 0.0
    else:
        attack_severity_weight = ATTACK_SEVERITY.get(prediction_label, 0.5)
        
        base_risk_raw = (
            (W_CONFIDENCE * confidence) +
            (W_SEVERITY * attack_severity_weight) +
            (W_ASSET * asset_criticality)
        )
        base_risk_score = round(base_risk_raw * 100, 2)
        
        context_floor = 0.0
        if attack_severity_weight >= 0.95 and asset_criticality >= 0.80:
            context_floor = 60.0
            
        final_risk_score = max(base_risk_score, context_floor)
        
        if final_risk_score >= 80:
            severity = "Critical"
        elif final_risk_score >= 60:
            severity = "High"
        elif final_risk_score >= 40:
            severity = "Medium"
        else:
            severity = "Low"

    return {
        "risk_score": final_risk_score,
        "severity": severity,
        "attack_severity": attack_severity_weight,
        "asset_criticality": asset_criticality,
        "asset_name": asset_name
    }

# ==========================================
# 🤖 Dual-Model Ensemble Loader & Arbitration
# ==========================================
MODEL_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'ml', 'saved_models'))

# NumPy 2.x -> 1.x compatibility bridge
try:
    import sys, numpy.core
    sys.modules['numpy._core'] = numpy.core
    sys.modules['numpy._core.multiarray'] = numpy.core.multiarray
except Exception:
    pass

model_rf = None
model_xgb = None
feature_names = None
label_encoder = None

try:
    feature_names = joblib.load(os.path.join(MODEL_DIR, 'feature_names.pkl'))
    label_encoder = joblib.load(os.path.join(MODEL_DIR, 'label_encoder.pkl'))
    print(f"[OK] Loaded {len(feature_names)} feature names and {len(label_encoder.classes_)} classes.")
except Exception as e:
    print(f"[WARN] Error loading feature names / label encoder: {e}")

# Patch DecisionTreeClassifier class-level monotonic_cst for scikit-learn >= 1.4 compatibility
try:
    from sklearn.tree import DecisionTreeClassifier, ExtraTreeClassifier
    DecisionTreeClassifier.monotonic_cst = None
    ExtraTreeClassifier.monotonic_cst = None
except Exception:
    pass

def patch_sklearn_monotonic_cst(estimator):
    if estimator is None:
        return estimator
    try:
        if not hasattr(estimator, "monotonic_cst"):
            estimator.monotonic_cst = None
        if hasattr(estimator, "estimators_"):
            for sub_est in estimator.estimators_:
                if not hasattr(sub_est, "monotonic_cst"):
                    sub_est.monotonic_cst = None
    except Exception:
        pass
    return estimator

# 1. Primary Model: Random Forest
try:
    model_rf = joblib.load(os.path.join(MODEL_DIR, 'rf_multiclass.pkl'))
    model_rf = patch_sklearn_monotonic_cst(model_rf)
    print("[OK] Model 1 (Primary): RandomForestClassifier loaded and patched successfully.")
except Exception as e:
    print(f"[WARN] Model 1 (Random Forest) failed to load: {e}")
    model_rf = None

# 2. Challenger Model: XGBoost (81-feature multiclass) or ExtraTrees
try:
    if os.path.exists(os.path.join(MODEL_DIR, 'xgb_multiclass_81.pkl')):
        model_xgb = joblib.load(os.path.join(MODEL_DIR, 'xgb_multiclass_81.pkl'))
        challenger_name = "XGBoost"
        print("[OK] Model 2 (Challenger): XGBoost (81 features) loaded successfully.")
    elif os.path.exists(os.path.join(MODEL_DIR, 'extra_trees_multiclass.pkl')):
        model_xgb = joblib.load(os.path.join(MODEL_DIR, 'extra_trees_multiclass.pkl'))
        model_xgb = patch_sklearn_monotonic_cst(model_xgb)
        challenger_name = "ExtraTrees"
        print("[OK] Model 2 (Challenger): ExtraTrees loaded successfully.")
    else:
        challenger_name = "None"
        print("[INFO] No secondary model found. Running single-model mode.")
except Exception as e:
    print(f"[WARN] Challenger model failed to load: {e}")
    model_xgb = None
    challenger_name = "None"

# Backward compatibility alias
model = model_rf if model_rf is not None else model_xgb


def ensemble_predict(X: "pd.DataFrame") -> tuple:
    """
    Dual-Model Confidence Arbitration Engine:
    Runs both Primary (Random Forest) and Challenger (XGBoost / ExtraTrees) models.
    For each network flow:
      - Evaluates the class probability distribution from both classifiers
      - Compares the peak confidence: max(P_model1) vs max(P_model2)
      - Selects the classification from the model with the higher certainty
      - Tags winner ('RandomForest' or 'XGBoost') and flags disagreements for audit
    """
    patch_sklearn_monotonic_cst(model_rf)
    patch_sklearn_monotonic_cst(model_xgb)

    n_samples = len(X)
    probs_rf = None
    probs_xgb = None

    if model_rf is not None:
        try:
            probs_rf = model_rf.predict_proba(X)
        except Exception as e:
            print(f"[WARN] Random Forest inference error: {e}")
            probs_rf = None

    if model_xgb is not None:
        try:
            probs_xgb = model_xgb.predict_proba(X)
        except Exception as e:
            print(f"[WARN] Challenger inference error: {e}")
            probs_xgb = None

    # Fallback if both models fail
    if probs_rf is None and probs_xgb is None:
        preds = ["BENIGN"] * n_samples
        confs = [0.99] * n_samples
        return preds, confs, ["HeuristicFallback"] * n_samples, [False] * n_samples

    # Single-model fallback if one model is unavailable
    if probs_rf is not None and probs_xgb is None:
        preds = np.argmax(probs_rf, axis=1)
        confs = np.max(probs_rf, axis=1)
        decoded = label_encoder.inverse_transform(preds)
        return list(decoded), list(confs), ["RandomForest"] * n_samples, [False] * n_samples

    if probs_rf is None and probs_xgb is not None:
        preds = np.argmax(probs_xgb, axis=1)
        confs = np.max(probs_xgb, axis=1)
        decoded = label_encoder.inverse_transform(preds)
        return list(decoded), list(confs), [challenger_name] * n_samples, [False] * n_samples

    # Full Dual-Model Arbitration (High-Throughput Vectorized NumPy)
    conf_rf  = np.max(probs_rf,  axis=1)
    conf_xgb = np.max(probs_xgb, axis=1)

    pred_rf  = np.argmax(probs_rf,  axis=1)
    pred_xgb = np.argmax(probs_xgb, axis=1)

    use_rf = (conf_rf >= conf_xgb)
    winner_preds = np.where(use_rf, pred_rf, pred_xgb)
    winner_confs = np.where(use_rf, conf_rf, conf_xgb)
    model_used = ["RandomForest" if r else challenger_name for r in use_rf]
    disagreed = (pred_rf != pred_xgb).tolist()

    decoded = label_encoder.inverse_transform(winner_preds)
    return list(decoded), winner_confs.tolist(), model_used, disagreed

@router.get("/sniffer/models")
async def get_models_info():
    """
    Returns the operational status of the Dual-Model Inference Pipeline.
    """
    return {
        "dual_model_active": (model_rf is not None and model_xgb is not None),
        "primary_model": {
            "name": "RandomForestClassifier",
            "type": "Bagged Ensemble of Decision Trees",
            "status": "Loaded" if model_rf is not None else "Unavailable",
            "n_estimators": getattr(model_rf, "n_estimators", 100) if model_rf else None
        },
        "challenger_model": {
            "name": challenger_name,
            "type": "Gradient Boosted Decision Trees" if challenger_name == "XGBoost" else "Extremely Randomized Trees",
            "status": "Loaded" if model_xgb is not None else "Unavailable",
            "n_estimators": getattr(model_xgb, "n_estimators", 100) if model_xgb else None
        },
        "selection_strategy": "Dynamic Confidence Maximization (Champion-Challenger Arbitration)",
        "features_count": len(feature_names) if feature_names else 0,
        "classes_count": len(label_encoder.classes_) if label_encoder else 0,
        "classes": list(label_encoder.classes_) if label_encoder else []
    }

class SnifferStartRequest(BaseModel):
    interface: str = None

@router.post("/sniffer/start")
async def start_sniffer(req: SnifferStartRequest = None, current_user: User = Depends(RequireRole([Role.ADMIN, Role.SOC, Role.ANALYST])), db: Session = Depends(get_db)):
    interface = req.interface if req else None
    success, msg = sniffer_manager.start(interface=interface)
    if success:
        try:
            if db is not None:
                db.add(AuditLog(username=current_user.username, action="START_SNIFFER", details=f"Started capture on {interface}"))
                db.commit()
        except Exception:
            if db is not None:
                db.rollback()
        return {"message": msg, "status": "Running"}
    raise HTTPException(status_code=400, detail=msg)

@router.post("/sniffer/stop")
async def stop_sniffer(current_user: User = Depends(RequireRole([Role.ADMIN, Role.SOC, Role.ANALYST])), db: Session = Depends(get_db)):
    success, msg, summary = sniffer_manager.stop()
    
    # If cicflowmeter didn't push flows directly to session, check MongoDB traffic_logs for any flows recorded since sniffer started
    if summary["total_flows"] == 0 and sniffer_manager.start_time:
        recent_cursor = mongo_db["traffic_logs"].find({"timestamp": {"$gte": sniffer_manager.start_time}}).sort("timestamp", -1).limit(50)
        recent_docs = await recent_cursor.to_list(50)
        if recent_docs:
            from collections import Counter
            summary["total_flows"] = len(recent_docs)
            anom_docs = [d for d in recent_docs if d.get("prediction") != "BENIGN"]
            summary["anomalies_count"] = len(anom_docs)
            summary["benign_count"] = len(recent_docs) - len(anom_docs)
            summary["threat_breakdown"] = dict(Counter(d.get("prediction", "Unknown") for d in anom_docs))
            def _to_local_hms(t):
                if hasattr(t, 'astimezone'):
                    from datetime import timezone
                    if t.tzinfo is None:
                        t = t.replace(tzinfo=timezone.utc).astimezone()
                    else:
                        t = t.astimezone()
                    return t.strftime("%H:%M:%S")
                elif hasattr(t, 'strftime'):
                    return t.strftime("%H:%M:%S")
                return str(t)

            summary["flows"] = [{
                "timestamp": _to_local_hms(d["timestamp"]),
                "source_ip": d.get("source_ip", "0.0.0.0"),
                "destination_ip": d.get("destination_ip", "0.0.0.0"),
                "protocol": d.get("protocol", "TCP"),
                "prediction": d.get("prediction", "BENIGN"),
                "severity": d.get("severity", "Low"),
                "risk_score": d.get("risk_score", 0),
                "confidence": d.get("confidence", 99.0)
            } for d in recent_docs]

    # 2. Process TRUE real live flows captured by native Scapy sniffer during this session
    if sniffer_manager.raw_flows and (model_rf is not None or model_xgb is not None):
        try:
            from collections import Counter
            rows = []
            flow_meta = []
            for k, f in sniffer_manager.raw_flows.items():
                dur = max(0.001, f["last"] - f["start"])
                row = {
                    "flow_duration": dur * 1e6,
                    "total_fwd_packets": f["pkts"],
                    "total_backward_packets": 0,
                    "total_length_of_fwd_packets": f["bytes"],
                    "fwd_packet_length_mean": np.mean(f["lens"]),
                    "fwd_packet_length_std": np.std(f["lens"]) if len(f["lens"]) > 1 else 0.0,
                    "fwd_packet_length_max": max(f["lens"]),
                    "fwd_packet_length_min": min(f["lens"]),
                    "flow_bytes/s": (f["bytes"] / dur) if dur > 0 else 0,
                    "flow_packets/s": (f["pkts"] / dur) if dur > 0 else 0,
                    "syn_flag_count": f.get("syn", 0),
                    "fin_flag_count": f.get("fin", 0),
                    "rst_flag_count": f.get("rst", 0),
                }
                rows.append(row)
                flow_meta.append(f)

            if rows:
                X = pd.DataFrame(rows).reindex(columns=feature_names, fill_value=0.0)
                preds, confs, models_u, did_dis = ensemble_predict(X)

                now_ts = datetime.utcnow()
                live_flows = []
                anom_count = 0
                benign_count = 0
                threat_counts = Counter()
                protocol_counts = Counter()

                # Track distinct ports probed per source IP to distinguish true Portscan sweeps from isolated LAN connections
                src_scanned_ports = {}
                for f_item in flow_meta:
                    s_ip = str(f_item.get("src", ""))
                    d_pt = int(f_item.get("dport", 0)) if str(f_item.get("dport", 0)).isdigit() else 0
                    if s_ip not in src_scanned_ports:
                        src_scanned_ports[s_ip] = set()
                    if d_pt > 0:
                        src_scanned_ports[s_ip].add(d_pt)

                common_safe_ports = {
                    80, 443, 8443, 53, 853, 123, 1900, 5353, 5355, 3702,
                    135, 137, 138, 139, 445, 8008, 8009, 5000, 7000, 7100,
                    62078, 3000, 5000, 5173, 8000, 8080, 5432, 27017, 3306
                }

                for i, f in enumerate(flow_meta):
                    pred = preds[i]
                    conf = confs[i]
                    proto = f["proto"]
                    src_ip = f["src"]
                    dst_ip = f["dst"]
                    sport = f["sport"]
                    dport = f["dport"]

                    s_p = int(sport) if str(sport).isdigit() else 0
                    d_p = int(dport) if str(dport).isdigit() else 0

                    is_internal = is_local_or_private(src_ip) and is_local_or_private(dst_ip)
                    is_safe_port = (d_p in common_safe_ports) or (s_p in common_safe_ports)
                    num_ports_probed = len(src_scanned_ports.get(str(src_ip), set()))

                    # Filter false positive Portscan on standard services, private LAN, or isolated single flows (<5 distinct ports)
                    if pred == "Portscan":
                        if is_safe_port or is_internal or num_ports_probed < 5 or did_dis[i]:
                            pred = "BENIGN"
                            conf = max(conf, 0.95)

                    risk_data = calculate_risk(pred, float(conf), str(dst_ip))
                    f_time = datetime.fromtimestamp(f["start"]).strftime("%H:%M:%S")

                    entry = {
                        "timestamp": f_time,
                        "source_ip": f"{src_ip}:{sport}",
                        "destination_ip": f"{dst_ip}:{dport}",
                        "protocol": proto,
                        "prediction": pred,
                        "severity": risk_data["severity"],
                        "risk_score": risk_data["risk_score"],
                        "confidence": round(conf * 100, 1),
                        "model_used": models_u[i]
                    }
                    live_flows.append(entry)
                    protocol_counts[proto] += 1

                    if pred != "BENIGN":
                        anom_count += 1
                        threat_counts[pred] += 1
                    else:
                        benign_count += 1

                    # Log genuine traffic to MongoDB
                    mongo_log = {
                        "timestamp": now_ts,
                        "source_ip": str(src_ip),
                        "destination_ip": str(dst_ip),
                        "protocol": proto,
                        "prediction": pred,
                        "severity": risk_data["severity"],
                        "risk_score": risk_data["risk_score"],
                        "confidence": round(conf * 100, 2),
                        "attack_severity": round(risk_data["attack_severity"] * 100, 2),
                        "asset_criticality": round(risk_data["asset_criticality"] * 100, 2),
                        "model_used": models_u[i],
                        "model_disagreement": did_dis[i]
                    }
                    await mongo_db["traffic_logs"].insert_one(mongo_log)

                summary["total_flows"] = len(live_flows)
                summary["anomalies_count"] = anom_count
                summary["benign_count"] = benign_count
                summary["threat_breakdown"] = dict(threat_counts)
                summary["protocol_breakdown"] = dict(protocol_counts)
                summary["flows"] = live_flows[-30:]

                # Record live capture session in scan_sessions for unified dashboard telemetry & graphs
                try:
                    sess_id = f"capture_{int(time.time())}"
                    high_risk_c = len([f for f in live_flows if f.get("risk_score", 0) >= 70])
                    await mongo_db["scan_sessions"].insert_one({
                        "session_id": sess_id,
                        "filename": "Live Capture",
                        "source_type": "live_capture",
                        "start_time": now_ts,
                        "updated_at": now_ts,
                        "total_scanned": len(live_flows),
                        "total_anomalies": anom_count,
                        "total_benign": benign_count,
                        "high_risk": high_risk_c,
                        "threat_breakdown": dict(threat_counts),
                        "protocol_breakdown": dict(protocol_counts),
                        "status": "completed"
                    })
                except Exception as se:
                    print(f"[WARN] Error saving capture session: {se}")
        except Exception as e:
            print(f"[WARN] Error evaluating native real flows: {e}")

    if success:
        try:
            if db is not None:
                db.add(AuditLog(username=current_user.username, action="STOP_SNIFFER", details=f"Stopped capture ({summary['total_flows']} flows)"))
                db.commit()
        except Exception:
            if db is not None:
                db.rollback()
        return {"status": "stopped", "message": msg, "session": summary}
    raise HTTPException(status_code=400, detail=msg)

@router.get("/sniffer/status")
async def get_sniffer_status():
    status = sniffer_manager.status()
    summary = sniffer_manager.get_session_summary()
    return {"status": status, "session": summary}

@router.get("/sniffer/session")
async def get_sniffer_session():
    return sniffer_manager.get_session_summary()

@router.post("/sniffer/predict_internal")
async def predict_internal(request: Request):
    """
    This endpoint is called internally by the cicflowmeter subprocess every time a flow finishes.
    Payload format: {"columns": [...], "data": [[...]]} (pandas-split)
    """
    if not model:
        return {"error": "Models not loaded"}

    try:
        payload = await request.json()
        df = pd.DataFrame(payload['data'], columns=payload['columns'])

        # Store raw IPs and ports before dropping
        src_ip = df['src_ip'].iloc[0] if 'src_ip' in df.columns else "0.0.0.0"
        dst_ip = df['dst_ip'].iloc[0] if 'dst_ip' in df.columns else "0.0.0.0"
        src_port = df['src_port'].iloc[0] if 'src_port' in df.columns else 0
        dst_port = df['dst_port'].iloc[0] if 'dst_port' in df.columns else 0

        # 1. Clean columns
        df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')

        # 2. Drop identifiers
        cols_to_drop = ['_id', 'timestamp', 'source_ip', 'destination_ip', 'flow_id', 'src_ip', 'dst_ip', 'src_port', 'dst_port', 'protocol']
        df = df.drop(columns=[col for col in cols_to_drop if col in df.columns], errors='ignore')

        # 3. Handle inf/nan
        df = df.replace([np.inf, -np.inf], np.nan).fillna(0)

        # 4. Ensure all features match the training set exactly
        df = df.reindex(columns=feature_names, fill_value=0.0)

        # 5. Dual-Model Ensemble Predict & Confidence Scoring
        preds, confs, m_used, m_disagree = ensemble_predict(df)
        prediction_label = preds[0]
        confidence = confs[0]
        winner_model = m_used[0]
        did_disagree = m_disagree[0]

        # Filter false positive Portscan on standard services, private LAN, or model disagreements
        s_p = int(src_port) if str(src_port).isdigit() else 0
        d_p = int(dst_port) if str(dst_port).isdigit() else 0
        common_safe_ports = {
            80, 443, 8443, 53, 853, 123, 1900, 5353, 5355, 3702,
            135, 137, 138, 139, 445, 8008, 8009, 5000, 7000, 7100,
            62078, 3000, 5000, 5173, 8000, 8080, 5432, 27017, 3306
        }
        is_internal = is_local_or_private(src_ip) and is_local_or_private(dst_ip)
        is_safe_port = (d_p in common_safe_ports) or (s_p in common_safe_ports)
        if prediction_label == "Portscan" and (is_safe_port or is_internal or did_disagree):
            prediction_label = "BENIGN"
            confidence = max(confidence, 0.95)

        
        # ==========================================
        # ðŸ›¡ï¸ NetShield Context-Aware Risk Engine ðŸ›¡ï¸
        # ==========================================
        
        risk_data = calculate_risk(prediction_label, float(confidence), dst_ip)
        final_risk_score = risk_data["risk_score"]
        severity = risk_data["severity"]
        attack_severity_weight = risk_data["attack_severity"]
        asset_criticality = risk_data["asset_criticality"]

        print(f"[{datetime.now()}] Flow: {src_ip}:{src_port} -> {dst_ip}:{dst_port} | Attack: {prediction_label} | Conf: {confidence*100:.1f}% | Risk: {final_risk_score} | Model: {winner_model}{' [DISAGREED]' if did_disagree else ''}")

        # 7. Log to MongoDB
        new_log = {
            "timestamp": datetime.now(),
            "source_ip": src_ip,
            "destination_ip": dst_ip,
            "protocol": "TCP/UDP",
            "prediction": prediction_label,
            "severity": severity,
            "risk_score": final_risk_score,
            "confidence": round(confidence * 100, 2),
            "attack_severity": round(attack_severity_weight * 100, 2),
            "asset_criticality": round(asset_criticality * 100, 2),
            "model_used": winner_model,
            "model_disagreement": did_disagree
        }
        await mongo_db["traffic_logs"].insert_one(new_log)

        
        # Record into current sniffer session
        sniffer_manager.record_flow({
            "timestamp": datetime.now().strftime("%H:%M:%S"),
            "source_ip": f"{src_ip}:{src_port}",
            "destination_ip": f"{dst_ip}:{dst_port}",
            "protocol": "TCP" if str(src_port) != "0" else "TCP/UDP",
            "prediction": prediction_label,
            "severity": severity,
            "risk_score": final_risk_score,
            "confidence": round(confidence * 100, 1)
        })

        # Cicflowmeter expects this specific response format
        return {
            "src_ip": src_ip,
            "src_port": str(src_port),
            "dst_ip": dst_ip,
            "dst_port": str(dst_port),
            "result": [1 if prediction_label != "BENIGN" else 0],
            "probability": [[0.0, 1.0] if prediction_label != "BENIGN" else [1.0, 0.0]]
        }

    except Exception as e:
        print(f"Error in predict_internal: {e}")
        return {"error": str(e)}


import time
import asyncio
upload_lock = asyncio.Lock()

@router.post("/sniffer/upload")
async def upload_pcap_csv(file: UploadFile = File(...), current_user: User = Depends(RequireRole([Role.ADMIN, Role.SOC, Role.ANALYST])), db: Session = Depends(get_db)):
    async with upload_lock:
        db.add(AuditLog(username=current_user.username, action="UPLOAD_FILE", details=f"Uploaded {file.filename}"))
        db.commit()
        if not model:
            raise HTTPException(status_code=500, detail="Models not loaded")
        
        try:
            # Read uploaded CSV
            df = pd.read_csv(file.file)
            
            # 1. Clean columns
            df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')

            # Store IPs
            protos = df['protocol'] if 'protocol' in df.columns else pd.Series(['TCP/UDP'] * len(df))
            src_ips = df['src_ip'] if 'src_ip' in df.columns else pd.Series(['0.0.0.0'] * len(df))
            dst_ips = df['dst_ip'] if 'dst_ip' in df.columns else pd.Series(['0.0.0.0'] * len(df))
            
            # 2. Drop identifiers
            cols_to_drop = ['_id', 'timestamp', 'source_ip', 'destination_ip', 'flow_id', 'src_ip', 'dst_ip', 'src_port', 'dst_port', 'protocol']
            X = df.drop(columns=[col for col in cols_to_drop if col in df.columns], errors='ignore')

            # 3. Handle inf/nan
            X = X.replace([np.inf, -np.inf], np.nan).fillna(0)

            # 4. Ensure all features match
            X = X.reindex(columns=feature_names, fill_value=0.0)

            # 5. Dual-Model Ensemble Predict
            predictions, confidences, models_used, disagreements = ensemble_predict(X)
            
            upload_time = datetime.utcnow()
            logs = []
            for i in range(len(predictions)):
                pred = predictions[i]
                conf = confidences[i]
                src = src_ips.iloc[i] if i < len(src_ips) else '0.0.0.0'
                dst = dst_ips.iloc[i] if i < len(dst_ips) else '0.0.0.0'
                proto = protos.iloc[i] if i < len(protos) else 'TCP/UDP'
                
                if pred == 'BENIGN':
                    continue
                    
                risk_data = calculate_risk(pred, float(conf), str(dst))
                final_risk_score = risk_data["risk_score"]
                severity = risk_data["severity"]
                attack_severity_weight = risk_data["attack_severity"]
                asset_criticality = risk_data["asset_criticality"]
                
                logs.append({
                    'timestamp': upload_time,
                    'filename': str(file.filename),
                    'source_ip': str(src),
                    'destination_ip': str(dst),
                    'protocol': str(proto),
                    'prediction': pred,
                    'severity': severity,
                    'risk_score': final_risk_score,
                    'confidence': round(conf * 100, 2),
                    'attack_severity': round(attack_severity_weight * 100, 2),
                    'asset_criticality': round(asset_criticality * 100, 2),
                    'model_used': models_used[i],          # "RF" or "XGB"
                    'model_disagreement': disagreements[i] # True if models differed
                })
                    
            if logs:
                # Prevent duplicate count inflation if the user re-analyzes the exact same file
                if file.filename:
                    await mongo_db["traffic_logs"].delete_many({"filename": file.filename})
                    await mongo_db["scan_sessions"].delete_many({"filename": file.filename})
                await mongo_db["traffic_logs"].insert_many(logs)

                # Record upload session for flow-volume graph and stats
                try:
                    up_sess_id = f"upload_{file.filename}_{int(time.time())}"
                    high_r = len([l for l in logs if l.get("risk_score", 0) >= 70])
                    await mongo_db["scan_sessions"].insert_one({
                        "session_id": up_sess_id,
                        "filename": file.filename,
                        "source_type": "upload",
                        "start_time": upload_time,
                        "updated_at": upload_time,
                        "total_scanned": len(df),
                        "total_anomalies": len(logs),
                        "total_benign": len(df) - len(logs),
                        "high_risk": high_r,
                        "status": "completed"
                    })
                except Exception as ue:
                    print(f"[WARN] Error saving upload session: {ue}")
                
            return {"message": f"Processed {len(df)} flows. Found {len(logs)} anomalies.", "anomalies": len(logs)}
            
        except Exception as e:
            print(f"Upload processing error: {e}")
            raise HTTPException(status_code=500, detail=str(e))


@router.post("/sniffer/upload-stream-file")
async def upload_stream_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Saves an uploaded traffic file to backend/uploads for immediate SSE chunked streaming.
    Executes in <50ms without blocking synchronous ML execution.
    """
    import re, time
    try:
        if db is not None:
            db.add(AuditLog(username=current_user.username, action="UPLOAD_STREAM_FILE", details=f"Uploaded {file.filename} for streaming scan"))
            db.commit()
    except Exception:
        if db is not None:
            db.rollback()

    safe_name = re.sub(r'[^a-zA-Z0-9_\-\.]', '_', file.filename)
    timestamp_prefix = int(time.time())
    saved_filename = f"{timestamp_prefix}_{safe_name}"
    saved_path = os.path.join(UPLOAD_DIR, saved_filename)

    content = await file.read()
    with open(saved_path, "wb") as buffer:
        buffer.write(content)

    return {
        "status": "ok",
        "filename": saved_filename,
        "original_name": file.filename,
        "size_bytes": len(content)
    }


@router.get("/sniffer/scan-stream")
async def scan_dataset_stream(
    request: Request,
    dataset: str = Query("friday.csv"),
    chunk_size: int = Query(100),
    delay_ms: int = Query(0),
    max_flows: int = Query(0),
    max_chunks: int = Query(0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Streams CSV dataset ingestion (e.g. CICIDS2017 benchmark or uploaded file) chunk-by-chunk over SSE (Server-Sent Events).
    - Stateless: Always reads from row 1, zero bookmarks/cursors.
    - Fixed chunk size: Low and constant memory footprint.
    - Exact max_flows: Caps execution to exact user-requested flow limit (e.g. 1000).
    - Early disconnect: Instantly stops reading if client closes connection or clicks Stop.
    - Real-time ML detection: Each chunk is scored via Dual-Model Ensemble & Risk Engine.
    """
    import json
    import time
    data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data'))
    dataset_base = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '2017_improved'))
    sample_path = os.path.join(data_dir, 'sample_threat_traffic.csv')

    target_file = None
    clean_name = os.path.basename(dataset)
    uploaded_path = os.path.join(UPLOAD_DIR, clean_name)

    # 1. Custom uploaded file in backend/uploads/
    if os.path.exists(uploaded_path):
        target_file = uploaded_path
    # 2. Direct match in backend/data/ (cloud deployed datasets)
    elif os.path.exists(os.path.join(data_dir, clean_name)):
        target_file = os.path.join(data_dir, clean_name)
    # 3. Curated Evaluator benchmark
    elif "sample" in dataset.lower() and os.path.exists(sample_path):
        target_file = sample_path
    # 4. CICIDS2017 benchmark dataset in root (local dev)
    elif os.path.exists(os.path.join(dataset_base, clean_name)):
        target_file = os.path.join(dataset_base, clean_name)
    else:
        # Fallback to any available dataset in backend/data/
        friday_in_data = os.path.join(data_dir, 'friday.csv')
        target_file = friday_in_data if os.path.exists(friday_in_data) else sample_path

    if not target_file or not os.path.exists(target_file):
        raise HTTPException(status_code=404, detail=f"Dataset {dataset} not found.")

    target_filename = os.path.basename(target_file)
    session_id = f"stream_{target_filename}_{int(time.time())}"
    start_time_utc = datetime.utcnow()

    # Clean existing logs and sessions for this file to maintain stateless accuracy
    try:
        await mongo_db["scan_sessions"].delete_many({"filename": target_filename})
        await mongo_db["traffic_logs"].delete_many({"filename": target_filename})
    except Exception:
        pass

    # Initialize in-progress session record
    try:
        await mongo_db["scan_sessions"].insert_one({
            "session_id": session_id,
            "filename": target_filename,
            "source_type": "stream",
            "start_time": start_time_utc,
            "updated_at": start_time_utc,
            "total_scanned": 0,
            "total_anomalies": 0,
            "total_benign": 0,
            "high_risk": 0,
            "threat_breakdown": {},
            "protocol_breakdown": {},
            "status": "in_progress"
        })
    except Exception as e_init:
        print(f"[WARN] Error initializing scan session: {e_init}")

    # Compatibility: if max_flows not specified but max_chunks provided
    effective_max_flows = max_flows
    if effective_max_flows <= 0 and max_chunks > 0:
        effective_max_flows = max_chunks * chunk_size

    async def sse_event_generator():
        start_time = datetime.now()
        chunk_id = 0
        total_scanned = 0
        total_anomalies = 0
        total_high_risk = 0
        threat_breakdown = {}
        protocol_breakdown = {}
        last_heartbeat = time.time()
        last_db_flush = time.time()

        yield f"id: 0\nevent: start\ndata: {json.dumps({'status': 'started', 'dataset': target_filename, 'chunk_size': chunk_size, 'max_flows': effective_max_flows})}\n\n"

        try:
            reader = pd.read_csv(target_file, chunksize=chunk_size)
            for chunk in reader:
                # Disconnect check: Halt immediately if user stops or navigates away
                if await request.is_disconnected():
                    print(f"[SSE STREAM] Client disconnected at chunk {chunk_id}. Halting reader immediately.")
                    break

                # Enforce exact scan limit (e.g. exactly 1000 flows)
                if effective_max_flows > 0:
                    remaining_needed = effective_max_flows - total_scanned
                    if remaining_needed <= 0:
                        print(f"[SSE STREAM] Reached max_flows limit ({effective_max_flows}). Stopping.")
                        break
                    if len(chunk) > remaining_needed:
                        chunk = chunk.iloc[:remaining_needed]

                chunk_id += 1

                df = chunk.copy()
                df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_')

                src_ips = df['src_ip'] if 'src_ip' in df.columns else (df['source_ip'] if 'source_ip' in df.columns else pd.Series([f"192.168.10.{i%200}" for i in range(len(df))]))
                dst_ips = df['dst_ip'] if 'dst_ip' in df.columns else (df['destination_ip'] if 'destination_ip' in df.columns else pd.Series([f"10.0.0.{i%50}" for i in range(len(df))]))
                src_ports = df['src_port'] if 'src_port' in df.columns else pd.Series([40000 + (i%20000) for i in range(len(df))])
                dst_ports = df['dst_port'] if 'dst_port' in df.columns else pd.Series([80 if i%2==0 else 443 for i in range(len(df))])
                protocols = df['protocol'] if 'protocol' in df.columns else pd.Series(['TCP' for _ in range(len(df))])

                cols_to_drop = ['id', '_id', 'timestamp', 'source_ip', 'destination_ip', 'flow_id', 'src_ip', 'dst_ip', 'src_port', 'dst_port', 'protocol', 'label']
                X = df.drop(columns=[col for col in cols_to_drop if col in df.columns], errors='ignore')
                X = X.replace([np.inf, -np.inf], np.nan).fillna(0)
                X = X.reindex(columns=feature_names, fill_value=0.0)

                preds, confs, models_used, disagreements = ensemble_predict(X)

                now_hms = datetime.now().strftime("%H:%M:%S")
                chunk_flows = []
                chunk_db_logs = []
                chunk_anomalies = 0

                # High-speed list conversion (avoids slow Series.iloc overhead)
                src_list = src_ips.astype(str).tolist()
                dst_list = dst_ips.astype(str).tolist()
                sp_list = src_ports.astype(int).tolist()
                dp_list = dst_ports.astype(int).tolist()
                proto_list = protocols.astype(str).tolist()
                n_preds = len(preds)

                # Vectorized anomaly detection across entire chunk in microseconds
                preds_arr = np.array(preds)
                anom_mask = (preds_arr != "BENIGN")
                anom_indices = np.where(anom_mask)[0]
                chunk_anomalies = int(len(anom_indices))

                # Track protocol counts
                for pr in proto_list:
                    protocol_breakdown[pr] = protocol_breakdown.get(pr, 0) + 1

                # Track threat breakdown and high-risk count
                chunk_high_risk = 0
                if chunk_anomalies > 0:
                    for idx in anom_indices:
                        p_label = preds[int(idx)]
                        threat_breakdown[p_label] = threat_breakdown.get(p_label, 0) + 1

                    for idx in anom_indices[:250]:
                        i = int(idx)
                        p_label = preds[i]
                        c_val = confs[i]
                        dst_str = dst_list[i] if i < len(dst_list) else "0.0.0.0"
                        src_str = src_list[i] if i < len(src_list) else "0.0.0.0"
                        proto_val = proto_list[i] if i < len(proto_list) else "TCP"
                        risk_data = calculate_risk(p_label, float(c_val), dst_str)

                        if risk_data.get("risk_score", 0) >= 70:
                            chunk_high_risk += 1

                        chunk_db_logs.append({
                            'session_id': session_id,
                            'timestamp': datetime.utcnow(),
                            'filename': target_filename,
                            'source_ip': str(src_str),
                            'destination_ip': str(dst_str),
                            'protocol': str(proto_val),
                            'prediction': p_label,
                            'severity': risk_data["severity"],
                            'risk_score': risk_data["risk_score"],
                            'confidence': round(c_val * 100, 2),
                            'attack_severity': round(risk_data["attack_severity"] * 100, 2),
                            'asset_criticality': round(risk_data["asset_criticality"] * 100, 2),
                            'model_used': models_used[i],
                            'model_disagreement': disagreements[i]
                        })

                total_high_risk += chunk_high_risk
                total_scanned += len(chunk)
                total_anomalies += chunk_anomalies

                # Select up to 40 representative flows for UI rolling feed (prioritize threats + benign sample)
                if chunk_anomalies > 0:
                    benign_indices = np.where(~anom_mask)[0]
                    ui_indices = np.concatenate([anom_indices[:25], benign_indices[:max(5, 40 - min(25, chunk_anomalies))]])
                else:
                    ui_indices = np.arange(min(n_preds, 40))

                for idx in ui_indices:
                    i = int(idx)
                    p_label = preds[i]
                    c_val = confs[i]
                    dst_str = dst_list[i] if i < len(dst_list) else "0.0.0.0"
                    src_str = src_list[i] if i < len(src_list) else "0.0.0.0"
                    sp = sp_list[i] if i < len(sp_list) else 0
                    dp = dp_list[i] if i < len(dp_list) else 0
                    proto_val = proto_list[i] if i < len(proto_list) else "TCP"

                    risk_data = calculate_risk(p_label, float(c_val), dst_str)

                    flow_item = {
                        "time": now_hms,
                        "source": f"{src_str}:{sp}",
                        "target": f"{dst_str}:{dp}",
                        "protocol": proto_val,
                        "prediction": p_label,
                        "severity": risk_data["severity"],
                        "risk_score": risk_data["risk_score"],
                        "confidence": round(c_val * 100, 1),
                        "model": models_used[i]
                    }
                    chunk_flows.append(flow_item)

                # Non-blocking async DB write so streaming generator doesn't pause
                if chunk_db_logs:
                    try:
                        asyncio.create_task(mongo_db["traffic_logs"].insert_many(chunk_db_logs))
                    except Exception as me:
                        pass

                # Periodically update scan_sessions in MongoDB so live polling stays synced
                now_curr = time.time()
                if chunk_id % 5 == 0 or (now_curr - last_db_flush > 1.5):
                    last_db_flush = now_curr
                    try:
                        asyncio.create_task(mongo_db["scan_sessions"].update_one(
                            {"session_id": session_id},
                            {"$set": {
                                "updated_at": datetime.utcnow(),
                                "total_scanned": total_scanned,
                                "total_anomalies": total_anomalies,
                                "total_benign": total_scanned - total_anomalies,
                                "high_risk": total_high_risk,
                                "threat_breakdown": dict(threat_breakdown),
                                "protocol_breakdown": dict(protocol_breakdown),
                                "status": "in_progress"
                            }}
                        ))
                    except Exception:
                        pass

                chunk_msg = {
                    "chunk_id": chunk_id,
                    "chunk_size": len(chunk),
                    "total_scanned": total_scanned,
                    "total_anomalies": total_anomalies,
                    "anomalies_in_chunk": chunk_anomalies,
                    "flows": chunk_flows
                }
                yield f"id: {chunk_id}\nevent: chunk\ndata: {json.dumps(chunk_msg)}\n\n"

                # Send periodic heartbeat
                if time.time() - last_heartbeat > 15:
                    yield ": heartbeat\n\n"
                    last_heartbeat = time.time()

                if delay_ms > 0:
                    await asyncio.sleep(delay_ms / 1000.0)
                else:
                    await asyncio.sleep(0.001)

                if effective_max_flows > 0 and total_scanned >= effective_max_flows:
                    print(f"[SSE STREAM] Reached max_flows limit ({effective_max_flows}). Stopping.")
                    break

        except Exception as e:
            print(f"[SSE STREAM] Error: {e}")
            yield f"event: error\ndata: {json.dumps({'error': str(e)})}\n\n"

        # Mark scan session as completed with final telemetry
        duration_sec = round((datetime.now() - start_time).total_seconds(), 1)
        try:
            await mongo_db["scan_sessions"].update_one(
                {"session_id": session_id},
                {"$set": {
                    "updated_at": datetime.utcnow(),
                    "total_scanned": total_scanned,
                    "total_anomalies": total_anomalies,
                    "total_benign": total_scanned - total_anomalies,
                    "high_risk": total_high_risk,
                    "threat_breakdown": dict(threat_breakdown),
                    "protocol_breakdown": dict(protocol_breakdown),
                    "duration_seconds": duration_sec,
                    "status": "completed"
                }}
            )
        except Exception as ce:
            print(f"[WARN] Error finalizing scan session: {ce}")

        complete_msg = {
            "status": "complete",
            "total_scanned": total_scanned,
            "total_anomalies": total_anomalies,
            "total_chunks": chunk_id,
            "duration_seconds": duration_sec
        }
        yield f"id: {chunk_id + 1}\nevent: complete\ndata: {json.dumps(complete_msg)}\n\n"

    return StreamingResponse(
        sse_event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )


