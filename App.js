import { registerRootComponent } from 'expo';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const CONTRACT_ADDRESS = "0x9D822E5D33ed8f3dC0A954b5c5cB8751E81955DE";

export default function App() {
  const [role, setRole] = useState('buyer'); // 'buyer' veya 'service'
  const [tokenId, setTokenId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 1. ADIM: PROBLEM TANIMINA UYGUN DİNAMİK BLOKZİNCİR DEVLETİ (STATE)
  const [blockchainDatabase, setBlockchainDatabase] = useState({
    "1": {
      serial: "SN-RTX4050-MSTR",
      model: "NVIDIA RTX 4050 GPU (Monster Edition)",
      date: "14.11.2025",
      isWarrantyActive: true,
      ownerCount: 1,
      serviceHistory: [
        {
          date: "12.02.2026",
          center: "Monster Yetkili Servis (Kadıköy)",
          action: "Termal Macun Yenileme & Fan Temizliği",
          status: "Bakım Yapıldı",
          partsChanged: "Yok"
        }
      ]
    },
    "2": {
      serial: "SN-APEX9-WAVE",
      model: "Apex 9 Manyetik Switch Oyuncu Klavyesi",
      date: "22.01.2026",
      isWarrantyActive: false,
      ownerCount: 2,
      serviceHistory: [
        {
          date: "03.03.2026",
          center: "SteelSeries Yetkili Teknik Ofis",
          action: "W, A, S, D Manyetik Switch Değişimi",
          status: "Tamir Edildi",
          partsChanged: "4 Adet OmniPoint 2.0 Switch"
        }
      ]
    }
  });

  const [searchedData, setSearchedData] = useState(null);

  // SERVİS YETKİLİSİ İÇİN FORM STATE'LERİ
  const [inputTokenId, setInputTokenId] = useState('');
  const [serviceCenter, setServiceCenter] = useState('Monster Yetkili Servis (Merkez)');
  const [actionPerformed, setActionPerformed] = useState('');
  const [partsChangedNote, setPartsChangedNote] = useState('');
  const [status, setStatus] = useState('Parça Değişimi Yapıldı');

  // ALICI İÇİN BLOKZİNCİR SORGULAMA FONKSİYONU
  const handleQuery = async () => {
    if (!tokenId) {
      setError('Lütfen sorgulamak için bir Token ID girin.');
      return;
    }
    setLoading(true);
    setError('');
    setSearchedData(null);

    try {
      // Sepolia RPC Ağ Bağlantı Simülasyonu
      const response = await fetch('https://ethereum-sepolia-rpc.publicnode.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 }),
      });
      await response.json();

      setTimeout(() => {
        const result = blockchainDatabase[tokenId.trim()];
        if (result) {
          setSearchedData(result);
        } else {
          setError(`Token ID #${tokenId} ChainPass ağında bulunamadı!`);
        }
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Blokzincir ağına bağlanılamadı.');
      setLoading(false);
    }
  };

  // AKILLI SÖZLEŞMEYE YENİ SERVİS KAYDI EKLEME (MINT / WRITE) FONKSİYONU
  const handleAddServiceRecord = async () => {
    if (!inputTokenId || !actionPerformed || !partsChangedNote) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }
    if (!blockchainDatabase[inputTokenId]) {
      setError('Bu Token ID ye ait bir donanım kaydı bulunamadı.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Sepolia RPC Ağ Doğrulaması
      await fetch('https://ethereum-sepolia-rpc.publicnode.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 }),
      });

      setTimeout(() => {
        const today = new Date().toLocaleDateString('tr-TR');
        const newRecord = {
          date: today,
          center: serviceCenter,
          action: actionPerformed,
          status: status,
          partsChanged: partsChangedNote
        };

        // Blokzincir veritabanına yeni kaydı dinamik olarak push ediyoruz (Akıllı Sözleşme Simülasyonu)
        setBlockchainDatabase(prev => ({
          ...prev,
          [inputTokenId]: {
            ...prev[inputTokenId],
            serviceHistory: [newRecord, ...prev[inputTokenId].serviceHistory]
          }
        }));

        setSuccessMessage(`Başarılı! Servis kaydı ve "${partsChangedNote}" notu ChainPass akıllı sözleşmesine kalıcı olarak işlendi.`);
        setLoading(false);
        // Formu temizle
        setActionPerformed('');
        setPartsChangedNote('');
      }, 1500);

    } catch (err) {
      setError('Blokzincir ağına veri yazılamadı.');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        {/* ROL SEÇİM SEKMELERİ */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabButton, role === 'buyer' && styles.activeTab]} 
            onPress={() => { setRole('buyer'); setError(''); setSuccessMessage(''); }}
          >
            <Text style={[styles.tabText, role === 'buyer' && styles.activeTabText]}>🔍 İkinci El Alıcı Ekranı</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabButton, role === 'service' && styles.activeTab]} 
            onPress={() => { setRole('service'); setError(''); setSuccessMessage(''); }}
          >
            <Text style={[styles.tabText, role === 'service' && styles.activeTabText]}>🛠️ Yetkili Servis Paneli</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.brand}>ChainPass</Text>
          <Text style={styles.tagline}>
            {role === 'buyer' ? 'Blokzincir Geçmiş Doğrulama' : 'Akıllı Sözleşme Veri Girişi'}
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

          {/* ================= ROLLERİN GÖRÜNÜMLERİ ================= */}
          
          {role === 'buyer' ? (
            // ALICI EKRANI GÖRÜNÜMÜ
            <View style={{ width: '100%' }}>
              <TextInput
                style={styles.input}
                placeholder="Sorgulamak İçin Token ID Girin (Örn: 1)"
                placeholderTextColor="#64748b"
                value={tokenId}
                onChangeText={setTokenId}
                keyboardType="numeric"
              />
              <TouchableOpacity style={styles.button} onPress={handleQuery} disabled={loading}>
                {loading ? <ActivityIndicator color="#0f172a" /> : <Text style={styles.buttonText}>Blokzincirden Doğrula 🔍</Text>}
              </TouchableOpacity>

              {searchedData && (
                <View style={{ width: '100%', marginTop: 10 }}>
                  <View style={styles.resultBox}>
                    <Text style={styles.resultTitle}>🛡️ Doğrulanmış Donanım Pasaportu</Text>
                    <View style={styles.row}><Text style={styles.label}>Seri No:</Text><Text style={styles.value}>{searchedData.serial}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Marka/Model:</Text><Text style={styles.value}>{searchedData.model}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Üretim Tarihi:</Text><Text style={styles.value}>{searchedData.date}</Text></View>
                    <View style={styles.row}>
                      <Text style={styles.label}>Garanti:</Text>
                      <Text style={[styles.value, { color: searchedData.isWarrantyActive ? '#34d399' : '#f87171' }]}>
                        {searchedData.isWarrantyActive ? 'Aktif ✓' : 'Süre Dolmuş ✗'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.sectionTitle}>⏳ Blokzincir Servis & Değişim Günlüğü</Text>
                  {searchedData.serviceHistory.map((item, index) => (
                    <View key={index} style={styles.timelineBox}>
                      <View style={styles.timelineHeader}>
                        <Text style={styles.timelineDate}>📅 {item.date}</Text>
                        <Text style={[styles.timelineStatus, item.status.includes('Değişimi') && {backgroundColor: 'rgba(248, 113, 113, 0.1)', color: '#f87171'}]}>{item.status}</Text>
                      </View>
                      <Text style={styles.timelineCenter}>📍 {item.center}</Text>
                      <Text style={styles.timelineAction}>🔧 <Text style={{fontWeight: '700'}}>Müdahale:</Text> {item.action}</Text>
                      <Text style={styles.timelineParts}>🔁 <Text style={{fontWeight: '700'}}>Değişen Parça:</Text> {item.partsChanged}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ) : (
            // YETKİLİ SERVİS GİRİŞ PANELİ GÖRÜNÜMÜ
            <View style={{ width: '100%' }}>
              <TextInput
                style={styles.input}
                placeholder="Donanım Token ID"
                placeholderTextColor="#64748b"
                value={inputTokenId}
                onChangeText={setInputTokenId}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Müdahale Açıklaması (Örn: Ekran Değişimi)"
                placeholderTextColor="#64748b"
                value={actionPerformed}
                onChangeText={setActionPerformed}
              />
              <TextInput
                style={styles.input}
                placeholder="Değişen Parça Notu (Örn: Orijinal RTX 4050 Çipi)"
                placeholderTextColor="#64748b"
                value={partsChangedNote}
                onChangeText={setPartsChangedNote}
              />
              
              <TouchableOpacity style={[styles.button, {backgroundColor: '#f59e0b'}]} onPress={handleAddServiceRecord} disabled={loading}>
                {loading ? <ActivityIndicator color="#0f172a" /> : <Text style={styles.buttonText}>Blokzincire Kaydı İşle 🛠️</Text>}
              </TouchableOpacity>
            </View>
          )}

        </View>
      </ScrollView>
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  scrollContainer: { flexGrow: 1, alignItems: 'center', paddingTop: 20 },
  tabContainer: { flexDirection: 'row', width: '95%', backgroundColor: '#1e293b', borderRadius: 12, padding: 5, marginBottom: 15 },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#38bdf8' },
  tabText: { color: '#94a3b8', fontWeight: '700', fontSize: 13 },
  activeTabText: { color: '#0f172a' },
  card: { backgroundColor: '#1e293b', padding: 22, borderRadius: 25, width: '95%', alignItems: 'center', elevation: 5, marginBottom: 20 },
  brand: { fontSize: 32, fontWeight: '900', color: '#38bdf8' },
  tagline: { fontSize: 11, color: '#94a3b8', marginBottom: 20, fontWeight: '600', textTransform: 'uppercase' },
  input: { width: '100%', backgroundColor: '#0f172a', color: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, fontSize: 15, borderColor: '#334155', borderWidth: 1 },
  button: { width: '100%', backgroundColor: '#38bdf8', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 5 },
  buttonText: { color: '#0f172a', fontSize: 16, fontWeight: 'bold' },
  errorText: { color: '#f87171', marginBottom: 15, fontWeight: '600', textAlign: 'center', width: '100%' },
  successText: { color: '#34d399', marginBottom: 15, fontWeight: '600', textAlign: 'center', width: '100%' },
  resultBox: { width: '100%', backgroundColor: '#0f172a', padding: 18, borderRadius: 15, borderLeftWidth: 4, borderLeftColor: '#38bdf8' },
  resultTitle: { color: '#38bdf8', fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  sectionTitle: { color: '#94a3b8', fontSize: 13, fontWeight: '700', marginTop: 20, marginBottom: 10, textTransform: 'uppercase' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { color: '#64748b', fontSize: 13, fontWeight: '600' },
  value: { color: '#f8fafc', fontSize: 13, fontWeight: '700' },
  timelineBox: { width: '100%', backgroundColor: '#0f172a', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#1e293b' },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#1e293b', paddingBottom: 6, marginBottom: 8 },
  timelineDate: { color: '#38bdf8', fontSize: 12, fontWeight: '700' },
  timelineStatus: { color: '#34d399', fontSize: 11, fontWeight: '700', backgroundColor: 'rgba(52, 211, 153, 0.1)', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  timelineCenter: { color: '#94a3b8', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  timelineAction: { color: '#f8fafc', fontSize: 12, marginBottom: 4 },
  timelineParts: { color: '#cbd5e1', fontSize: 12 }
});

registerRootComponent(App);