import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Switch,
  ActivityIndicator,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { apiFetch } from '../services/api';

export default function InventarioScreen() {
  const [items, setItems] = useState([]);
  const [deportes, setDeportes] = useState([]);
  const [filtroDeporte, setFiltroDeporte] = useState('');
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal B2 — Solicitar Préstamo Deportivo
  const [selectedItem, setSelectedItem] = useState(null);
  const [loanForm, setLoanForm] = useState({ cantidad: '1', canchaOActividad: '' });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const cargarInventario = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (filtroDeporte) params.append('deporte', filtroDeporte);
      if (soloDisponibles) params.append('disponible', 'true');

      const query = params.toString() ? `?${params.toString()}` : '';
      const data = await apiFetch(`/api/sports/items${query}`);
      setItems(Array.isArray(data) ? data : data.items || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    apiFetch('/api/sports/items/sports')
      .then((data) => setDeportes(Array.isArray(data) ? data : data.sports || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    cargarInventario();
  }, [filtroDeporte, soloDisponibles]);

  const handleSelect = (item) => {
    setSelectedItem(item);
    setLoanForm({ cantidad: '1', canchaOActividad: '' });
    setModalError('');
  };

  const handleSubmit = async () => {
    setModalError('');
    const cantidadNum = Number(loanForm.cantidad);

    if (!cantidadNum || cantidadNum < 1 || cantidadNum > selectedItem.disponibles) {
      setModalError(`La cantidad debe estar entre 1 y ${selectedItem.disponibles}.`);
      return;
    }
    if (!loanForm.canchaOActividad.trim()) {
      setModalError('Indica la cancha o actividad deportiva.');
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch('/api/sports/loans', {
        method: 'POST',
        body: {
          itemId: selectedItem.id,
          cantidad: cantidadNum,
          canchaOActividad: loanForm.canchaOActividad.trim(),
        },
      });
      Alert.alert('Éxito', 'Préstamo solicitado correctamente.');
      setSelectedItem(null);
      cargarInventario();
    } catch (err) {
      setModalError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.badge}>{item.codigo}</Text>
        <Text style={styles.sportTag}>{item.deporte}</Text>
      </View>
      <Text style={styles.itemTitle}>{item.nombre}</Text>
      <Text style={styles.detail}>Estado físico: {item.estadoFisico}</Text>
      <Text style={styles.detail}>Disponibles: {item.disponibles}</Text>

      <TouchableOpacity
        style={[styles.btnPrimary, item.disponibles <= 0 && styles.btnDisabled]}
        disabled={item.disponibles <= 0}
        onPress={() => handleSelect(item)}
      >
        <Text style={styles.btnText}>
          {item.disponibles > 0 ? 'Solicitar Préstamo' : 'Sin Stock'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Filtros B1 */}
      <View style={styles.filtersBox}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
          <TouchableOpacity
            style={[styles.chip, filtroDeporte === '' && styles.chipActive]}
            onPress={() => setFiltroDeporte('')}
          >
            <Text style={[styles.chipText, filtroDeporte === '' && styles.chipTextActive]}>
              Todas
            </Text>
          </TouchableOpacity>
          {deportes.map((dep, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.chip, filtroDeporte === dep && styles.chipActive]}
              onPress={() => setFiltroDeporte(dep)}
            >
              <Text style={[styles.chipText, filtroDeporte === dep && styles.chipTextActive]}>
                {dep}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Solo disponibles</Text>
          <Switch value={soloDisponibles} onValueChange={setSoloDisponibles} />
        </View>
      </View>

      {error ? <Text style={styles.errorBox}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay artículos con ese filtro.</Text>}
        />
      )}

      {/* Modal B2 — Solicitar Préstamo Deportivo */}
      <Modal visible={!!selectedItem} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Solicitar: {selectedItem?.nombre}</Text>
            <Text style={styles.detail}>Disponibles: {selectedItem?.disponibles}</Text>

            {modalError ? <Text style={styles.errorBox}>{modalError}</Text> : null}

            <Text style={styles.label}>Cantidad a solicitar</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={loanForm.cantidad}
              onChangeText={(t) => setLoanForm({ ...loanForm, cantidad: t })}
            />

            <Text style={styles.label}>Cancha o Actividad</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. Cancha 2 - Torneo"
              value={loanForm.canchaOActividad}
              onChangeText={(t) => setLoanForm({ ...loanForm, canchaOActividad: t })}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.btnSecondary}
                onPress={() => setSelectedItem(null)}
                disabled={submitting}
              >
                <Text style={styles.btnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnPrimary, { flex: 1 }, submitting && styles.btnDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnText}>Confirmar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9', padding: 14 },
  filtersBox: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 12 },
  chipsRow: { flexDirection: 'row', marginBottom: 10 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    marginRight: 8,
  },
  chipActive: { backgroundColor: '#2563eb' },
  chipText: { color: '#334155', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  switchLabel: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 10, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  badge: {
    backgroundColor: '#e0e7ff',
    color: '#3730a3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: 'bold',
    fontSize: 12,
  },
  sportTag: { color: '#64748b', fontWeight: '600', fontSize: 12 },
  itemTitle: { fontSize: 17, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  detail: { fontSize: 14, color: '#475569', marginBottom: 4 },
  btnPrimary: {
    backgroundColor: '#2563eb',
    padding: 11,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  btnSecondary: {
    backgroundColor: '#64748b',
    padding: 11,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  btnDisabled: { backgroundColor: '#94a3b8' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  errorBox: { backgroundColor: '#fee2e2', color: '#b91c1c', padding: 10, borderRadius: 8, marginBottom: 10 },
  emptyText: { textAlign: 'center', color: '#64748b', marginTop: 30 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: { backgroundColor: '#fff', padding: 20, borderRadius: 12 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a', marginBottom: 6 },
  label: { fontSize: 14, fontWeight: '600', marginTop: 10, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 14 },
});