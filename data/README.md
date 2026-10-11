# CICIDS2017 Evaluation Dataset & Benchmark

This directory contains the sample evaluation dataset for the **ZeroBreach AI** Intrusion Detection & Threat Monitoring System, sourced from the benchmark **CICIDS2017** dataset developed by the Canadian Institute for Cybersecurity (CIC) and the University of New Brunswick (UNB).

---

## 1. Included Sample Dataset (`CICIDS2017_sample_traffic.csv`)

Due to GitHub's file size limit (100 MB per file), the complete multi-gigabyte raw dataset is hosted externally. This repository includes a curated, multi-class sample dataset for immediate evaluation, testing, and benchmarking.

* **File:** [`CICIDS2017_sample_traffic.csv`](./CICIDS2017_sample_traffic.csv)
* **Total Records:** 4,001 flows
* **Features:** 84 statistical network flow features (Flow Duration, Packet Lengths, IATs, Flags, Subflows, Window Sizes, etc.)
* **File Size:** ~2.3 MB (Git & GitHub optimized)

### Class Distribution in Sample:
| Category | Label | Flow Count |
| :--- | :--- | :--- |
| **Normal Traffic** | BENIGN | 1,000 |
| **Denial of Service** | DoS Hulk | 300 |
| | DoS Slowhttptest | 200 |
| | DoS Slowloris | 200 |
| | DoS GoldenEye | 200 |
| | Heartbleed | 11 |
| **Distributed DoS** | DDoS | 300 |
| **Reconnaissance** | Portscan | 300 |
| **Botnet Activity** | Botnet | 300 |
| **Brute Force** | FTP-Patator | 200 |
| | SSH-Patator | 200 |
| **Web Attacks** | Web Attack - Brute Force | 273 |
| | Web Attack - XSS | 218 |
| | Web Attack - SQL Injection | 18 |
| **Infiltration** | Infiltration & Portscan | 281 |
| **Total** | | **4,001** |

---

## 2. Full CICIDS2017 Dataset Download

For training full-scale production models on the complete 2.8+ million flow dataset:
* **Official Source:** [Canadian Institute for Cybersecurity (UNB)](https://www.unb.ca/cic/datasets/ids-2017.html)
* **Raw Files:**
  * `Monday-WorkingHours.pcap_ISCX.csv` (Benign baseline)
  * `Tuesday-WorkingHours.pcap_ISCX.csv` (FTP & SSH Patator)
  * `Wednesday-workingHours.pcap_ISCX.csv` (DoS Hulk, GoldenEye, Slowloris, Slowhttptest, Heartbleed)
  * `Thursday-WorkingHours-Morning-WebAttacks.pcap_ISCX.csv` (Web Attacks: Brute Force, XSS, SQLi)
  * `Thursday-WorkingHours-Afternoon-Infilteration.pcap_ISCX.csv` (Infiltration)
  * `Friday-WorkingHours-Morning.pcap_ISCX.csv` (Botnet)
  * `Friday-WorkingHours-Afternoon-PortScan.pcap_ISCX.csv` (Portscan)
  * `Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv` (DDoS)

Place the extracted CSVs into the `2017_improved/` directory at the project root to run the retraining pipeline scripts in [`backend/scripts/`](../backend/scripts/).
