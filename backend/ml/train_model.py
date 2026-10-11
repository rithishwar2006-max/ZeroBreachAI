import os
import sys
import pandas as pd
import numpy as np
import joblib
from pymongo import MongoClient
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core.config import settings

def train_anomaly_detector():
    print("Fetching training data from MongoDB...")
    client = MongoClient(settings.MONGO_DATABASE_URI)
    db = client[settings.MONGO_DB]
    collection = db["traffic_logs"]
    
    # Retrieve data
    cursor = collection.find({})
    df = pd.DataFrame(list(cursor))
    
    if len(df) == 0:
        print("No data found in MongoDB. Run the ingestion script first.")
        return
        
    print(f"Loaded {len(df)} records. Preprocessing...")
    
    # Drop irrelevant or identifying columns
    cols_to_drop = ['_id', 'timestamp', 'source_ip', 'destination_ip', 'flow_id', 'src_ip', 'dst_ip', 'src_port', 'dst_port', 'protocol']
    df = df.drop(columns=[col for col in cols_to_drop if col in df.columns], errors='ignore')
    
    # Ensure all remaining features are numeric
    numeric_df = df.select_dtypes(include=[np.number]).copy()
    
    # Target variable mapping
    # Assuming 'BENIGN' is 0, anything else is 1 (Attack)
    y = df['label'].apply(lambda x: 0 if x == 'BENIGN' else 1)
    
    # Impute or drop remaining NaNs
    numeric_df = numeric_df.fillna(0)
    
    X = numeric_df
    
    print(f"Training on {X.shape[1]} features.")
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    print("Training XGBoost Classifier...")
    model = XGBClassifier(n_estimators=100, max_depth=6, learning_rate=0.1, use_label_encoder=False, eval_metric='logloss')
    model.fit(X_train_scaled, y_train)
    
    print("Evaluating model...")
    y_pred = model.predict(X_test_scaled)
    
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    
    print("-" * 30)
    print(f"Model Performance Metrics:")
    print(f"Accuracy:  {acc:.4f}")
    print(f"Precision: {prec:.4f}")
    print(f"Recall:    {rec:.4f}")
    print(f"F1-Score:  {f1:.4f}")
    print("-" * 30)
    
    # Save the model and scaler
    model_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "saved_models")
    
    print("Saving model pipeline...")
    joblib.dump(scaler, os.path.join(model_dir, "scaler.pkl"))
    joblib.dump(model, os.path.join(model_dir, "xgboost_model.pkl"))
    
    # Also save the list of feature names so the inference API knows exactly what order to expect
    joblib.dump(list(X.columns), os.path.join(model_dir, "feature_names.pkl"))
    
    print("Model training complete and saved successfully.")

if __name__ == "__main__":
    train_anomaly_detector()
