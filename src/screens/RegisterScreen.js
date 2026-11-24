import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    nombre: '',
    matricula: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async () => {
    setError('');
    if (!form.nombre || !form.matricula || !form.email || !form.password || !form.confirmPassword) {
      setError('Completa todos los campos.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await register({
        nombre: form.nombre.trim(),
        matricula: form.matricula.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      Alert.alert('Registro exitoso', 'Tu cuenta ha sido creada. Inicia sesión.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Registro de Estudiante</Text>

        {error ? <Text style={styles.errorBox}>{error}</Text> : null}

        <Text style={styles.label}>Nombre Completo</Text>
        <TextInput
          style={styles.input}
          value={form.nombre}
          onChangeText={(t) => handleChange('nombre', t)}
        />

        <Text style={styles.label}>Matrícula</Text>
        <TextInput
          style={styles.input}
          value={form.matricula}
          onChangeText={(t) => handleChange('matricula', t)}
        />

        <Text style={styles.label}>Correo Electrónico</Text>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          value={form.email}
          onChangeText={(t) => handleChange('email', t)}
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={form.password}
          onChangeText={(t) => handleChange('password', t)}
        />

        <Text style={styles.label}>Confirmar Contraseña</Text>
        <TextInput
          style={styles.input}
          secureTextEntry
          value={form.confirmPassword}
          onChangeText={(t) => handleChange('confirmPassword', t)}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Crear Cuenta</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.linkBtn}>
          <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f4f6f9', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#fff', padding: 24, borderRadius: 12, elevation: 3 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#0f172a', marginBottom: 16, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f8fafc',
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { backgroundColor: '#94a3b8' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  errorBox: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 13,
  },
  linkBtn: { marginTop: 16, alignItems: 'center' },
  linkText: { color: '#2563eb', fontWeight: '600' },
});