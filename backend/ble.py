import asyncio
from bleak import BleakClient, BleakScanner
import binascii
import struct
import math
import numpy as np
from scipy.spatial.transform import Rotation as R
from backyendy import insert_data

DEVICE_UUID = "00:18:DA:40:6A:49"
CHARACTERISTIC_UUID = "6e400003-c352-11e5-953d-0002a5d5c51b"

ble_buffer = bytearray()

angle_packets = []

# Reference position for straight/neutral posture (will be set on first run)
reference_angles = None

def decode_data(raw_data):
    for i in range(len(raw_data) - 10):  
        if raw_data[i] == 0x55 and raw_data[i + 1] == 0x53:
            buffer = raw_data[i:i + 11] 
            for j in range(i + 11, len(raw_data) - 10): 
                if raw_data[j] == 0x55 and raw_data[j + 1] == 0x53:
                    return [buffer, raw_data[j:j + 11]] 
    return []  

def hex_packet(raw_data):
    return binascii.hexlify(raw_data).decode()

def angle_output_decode(angle_data_packet):
    if len(angle_data_packet) != 11 or angle_data_packet[0] != 0x55 or angle_data_packet[1] != 0x53:
        raise ValueError("Invalid packet")

    roll_raw = struct.unpack('<h', bytes(angle_data_packet[2:4]))[0]  
    pitch_raw = struct.unpack('<h', bytes(angle_data_packet[4:6]))[0]
    yaw_raw = struct.unpack('<h', bytes(angle_data_packet[6:8]))[0]

    roll_raw = (roll_raw / 32768) * 180
    pitch_raw = (pitch_raw / 32768) * 180
    yaw_raw = (yaw_raw / 32768) * 180

    return [roll_raw, pitch_raw, yaw_raw]

def magic(data1, data2, degrees=True):
    R1 = R.from_euler('xyz', data1, degrees=degrees).as_matrix()
    R2 = R.from_euler('xyz', data2, degrees=degrees).as_matrix()

    R_rel = R1.T @ R2
    theta = np.arccos((np.trace(R_rel) - 1) / 2)

    return np.degrees(theta) if degrees else theta

async def notification_handler(sender, data):
    global ble_buffer, angle_packets, reference_angles
    
    try:
        
        ble_buffer.extend(data)
        
       
        while len(ble_buffer) >= 11:

            idx = -1
            for i in range(len(ble_buffer) - 1):
                if ble_buffer[i] == 0x55 and ble_buffer[i + 1] == 0x53:
                    idx = i
                    break
            
            if idx == -1:

                ble_buffer = ble_buffer[1:]
                continue
            
            if idx > 0:
               
                ble_buffer = ble_buffer[idx:]
            
            if len(ble_buffer) < 11:
               
                break
            
          
            packet = bytes(ble_buffer[:11])
            ble_buffer = ble_buffer[11:]
            
          
            try:
                hihi = angle_output_decode(packet)
                angle_packets.append(hihi)
                #print(f"[BLE] Roll={hihi[0]:7.2f}°, Pitch={hihi[1]:7.2f}°, Yaw={hihi[2]:7.2f}°")
                
              
                if len(angle_packets) >= 2:
                    data1 = angle_packets[0]
                    data2 = angle_packets[1]
                    
                    if reference_angles is None:
                        reference_angles = data2
                        #print(f"[BLE] *** REFERENCE SET ***")
                        #print(f"[BLE] Ref: R={reference_angles[0]:.1f}° P={reference_angles[1]:.1f}° Y={reference_angles[2]:.1f}°")
                        angle_packets = []
                        continue

                    angle = magic(reference_angles, data2)
                    #print(f"[BLE] Data1: R={data1[0]:.1f}° P={data1[1]:.1f}° Y={data1[2]:.1f}°")
                    #print(f"[BLE] Data2: R={data2[0]:.1f}° P={data2[1]:.1f}° Y={data2[2]:.1f}°")
                    print(f"[BLE] >>> Bending angle: {angle:.2f}°")
                    insert_data(angle)
                    angle_packets = []

            except ValueError as e:
                print(f"[BLE] Invalid packet: {e}")

    except Exception as e:
        print(f"[BLE] Error processing notification: {e}")

async def subscribe():
    async with BleakClient(DEVICE_UUID) as client:
        print(f"Connected to {DEVICE_UUID}: {client.is_connected}")
        await client.start_notify(CHARACTERISTIC_UUID, notification_handler)
        print(f"Subscribed to notifications from {CHARACTERISTIC_UUID}")
        await asyncio.sleep(180)
        await client.stop_notify(CHARACTERISTIC_UUID)
        print(f"Unsubscribed from {CHARACTERISTIC_UUID}")

asyncio.run(subscribe())
