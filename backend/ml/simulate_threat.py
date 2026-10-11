"""
ZeroBreach AI - Live Attack & IP Simulation Utility
====================================================
Use this script to simulate real network traffic and cyber threats with custom
or spoofed IP addresses on your local interface.

Usage:
    # 1. Simulate a Port Scan with custom source IP:
    python simulate_threat.py --type portscan --src 192.168.1.99 --dst 10.138.59.244

    # 2. Simulate a SYN Flood / DDoS burst:
    python simulate_threat.py --type ddos --src 185.220.101.5 --dst 10.138.59.244 --count 50

    # 3. Simulate a Botnet C2 Beacon to an external server:
    python simulate_threat.py --type botnet --src 10.138.59.244 --dst 45.33.32.156 --port 8080

    # 4. Send a custom single packet with any IP you choose:
    python simulate_threat.py --type custom --src 10.99.99.99 --dst 10.138.59.244 --port 443
"""

import argparse
import time
import sys
import scapy.all as scapy

def get_active_interface_guid():
    try:
        for name, iface in scapy.IFACES.items():
            dev_name = getattr(iface, 'name', '')
            desc = getattr(iface, 'description', '')
            guid = getattr(iface, 'guid', '')
            network_name = getattr(iface, 'network_name', '')
            if "wi-fi" in dev_name.lower() or "wireless" in dev_name.lower() or "wi-fi" in network_name.lower():
                return network_name or (rf"\Device\NPF_{guid}" if guid else dev_name)
    except Exception:
        pass
    return "Wi-Fi"

def simulate_portscan(src_ip: str, dst_ip: str, iface: str):
    print(f"\n[!] Simulating PORTSCAN from spoofed IP {src_ip} -> {dst_ip}...")
    target_ports = [21, 22, 23, 25, 53, 80, 110, 135, 139, 143, 443, 445, 1433, 3306, 3389, 8080]
    local_mac = scapy.get_if_hwaddr(iface)

    for port in target_ports:
        pkt = (
            scapy.Ether(src=local_mac, dst="ff:ff:ff:ff:ff:ff") /
            scapy.IP(src=src_ip, dst=dst_ip) /
            scapy.TCP(sport=scapy.RandShort(), dport=port, flags="S")
        )
        scapy.sendp(pkt, iface=iface, verbose=False)
        print(f"  -> Probe TCP SYN: {src_ip}:{pkt[scapy.TCP].sport} -> {dst_ip}:{port}")
        time.sleep(0.05)
    print("[+] Portscan simulation completed. Packets transmitted across interface.")

def simulate_ddos(src_ip: str, dst_ip: str, count: int, iface: str):
    print(f"\n[!] Simulating SYN FLOOD / DDOS burst ({count} packets) to {dst_ip}...")
    local_mac = scapy.get_if_hwaddr(iface)

    for i in range(count):
        # Varying spoofed source port and IP
        actual_src = src_ip if src_ip else f"185.220.{i%250}.{10 + (i%200)}"
        pkt = (
            scapy.Ether(src=local_mac, dst="ff:ff:ff:ff:ff:ff") /
            scapy.IP(src=actual_src, dst=dst_ip) /
            scapy.TCP(sport=scapy.RandShort(), dport=80, flags="S")
        )
        scapy.sendp(pkt, iface=iface, verbose=False)
        if (i + 1) % 10 == 0:
            print(f"  -> Sent {i + 1}/{count} flood packets...")
        time.sleep(0.01)
    print("[+] DDoS burst simulation completed.")

def simulate_botnet(src_ip: str, dst_ip: str, port: int, iface: str):
    print(f"\n[!] Simulating BOTNET C2 Beaconing: {src_ip} -> {dst_ip}:{port}...")
    local_mac = scapy.get_if_hwaddr(iface)

    for round_num in range(5):
        pkt = (
            scapy.Ether(src=local_mac, dst="ff:ff:ff:ff:ff:ff") /
            scapy.IP(src=src_ip, dst=dst_ip) /
            scapy.TCP(sport=54321, dport=port, flags="PA") /
            b"HEARTBEAT_BEACON_ID=9021;STATUS=ACTIVE"
        )
        scapy.sendp(pkt, iface=iface, verbose=False)
        print(f"  -> Transmitted C2 Beacon #{round_num + 1} to {dst_ip}:{port}")
        time.sleep(0.5)
    print("[+] Botnet beaconing simulation completed.")

def simulate_custom(src_ip: str, dst_ip: str, port: int, proto: str, iface: str):
    print(f"\n[!] Injecting custom raw packet: {src_ip} -> {dst_ip}:{port} ({proto})...")
    local_mac = scapy.get_if_hwaddr(iface)

    if proto.upper() == "UDP":
        pkt = (
            scapy.Ether(src=local_mac, dst="ff:ff:ff:ff:ff:ff") /
            scapy.IP(src=src_ip, dst=dst_ip) /
            scapy.UDP(sport=50000, dport=port) /
            b"CUSTOM_TEST_PAYLOAD"
        )
    else:
        pkt = (
            scapy.Ether(src=local_mac, dst="ff:ff:ff:ff:ff:ff") /
            scapy.IP(src=src_ip, dst=dst_ip) /
            scapy.TCP(sport=50000, dport=port, flags="S")
        )
    scapy.sendp(pkt, iface=iface, verbose=False)
    print("[+] Custom packet injected successfully.")

def main():
    parser = argparse.ArgumentParser(description="ZeroBreach AI Attack & IP Simulation Utility")
    parser.add_argument("--type", choices=["portscan", "ddos", "botnet", "custom"], default="portscan", help="Type of threat to simulate")
    parser.add_argument("--src", type=str, default="192.168.1.99", help="Source IP to spoof")
    parser.add_argument("--dst", type=str, default="10.138.59.244", help="Target IP address")
    parser.add_argument("--port", type=int, default=8080, help="Target port for botnet/custom")
    parser.add_argument("--proto", type=str, default="TCP", choices=["TCP", "UDP"], help="Protocol for custom packet")
    parser.add_argument("--count", type=int, default=30, help="Packet count for DDoS")
    parser.add_argument("--iface", type=str, default=None, help="Interface name or GUID")

    args = parser.parse_args()
    iface = args.iface or get_active_interface_guid()

    print("==================================================")
    print("   ZEROBREACH AI - LIVE NETWORK THREAT SIMULATOR  ")
    print("==================================================")
    print(f"[*] Binding to Hardware Interface: {iface}")
    print(f"[*] Attack Pattern: {args.type.upper()}")
    print(f"[*] Spoofed Source IP: {args.src}")
    print(f"[*] Target IP: {args.dst}")

    if args.type == "portscan":
        simulate_portscan(args.src, args.dst, iface)
    elif args.type == "ddos":
        simulate_ddos(args.src, args.dst, args.count, iface)
    elif args.type == "botnet":
        simulate_botnet(args.src, args.dst, args.port, iface)
    elif args.type == "custom":
        simulate_custom(args.src, args.dst, args.port, args.proto, iface)

if __name__ == "__main__":
    main()
