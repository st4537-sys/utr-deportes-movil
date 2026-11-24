import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { apiFetch } from '../services/api';

export default function MisPrestamosScreen() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarPrestamos = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/api/sports/loans');
      setLoans(Array.isArray(data) ? data : data.loans || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarPrestamos();
    }, [])
  );

  const renderLoan = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Text style={styles.folio}>Folio #{item.loanId || item.id}</Text>
        <Text style={item.estatus === 'ACTIVO' ? styles.statusActive : styles.statusDone}>
          {item.estatus}
        </Text>
      </View>
      <Text style={styles.title}>{item.item}</Text>
      <Text style={styles.detail}>Cantidad: {item.cantidad}</Text>
      {item.canchaOActividad ? (
        <Text style={styles.detail}>Cancha/Actividad: {item.canchaOActividad}</Text>
      ) : null}
      {item.horaSalida ? (
        <Text style={styles.detail}>Salida: {new Date(item.horaSalida).toLocaleString()}</Text>
      ) : null}
    </View>
  );

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.errorBox}>{error}</Text> : null}
      {loading ? (
        <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={loans}
          keyExtractor={(item) => String(item.loanId || item.id)}
          renderItem={renderLoan}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Aún no tienes préstamos registrados.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9', padding: 14 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 10, marginBottom: 12, elevation: 2 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  folio: { fontWeight: 'bold', color: '#475569' },
  statusActive: { color: '#059669', fontWeight: 'bold' },
  statusDone: { color: '#64748b', fontWeight: 'bold' },
  title: { fontSize: 17, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  detail: { fontSize: 14, color: '#475569', marginBottom: 2 },
  errorBox: { backgroundColor: '#fee2e2', color: '#b91c1c', padding: 10, borderRadius: 8, marginBottom: 10 },
  emptyText: { textAlign: 'center', color: '#64748b', marginTop: 30 },
});