import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import api from '../config/api';

const TestConnection = () => {
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const testConnection = async () => {
            try {
                const response = await api.get('/');
                setMessage(response.data.message);
            } catch (err) {
                setError('Failed to connect to the backend');
                console.error(err);
            }
        };

        testConnection();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Backend Connection Test</Text>
            {message ? (
                <Text style={styles.success}>{message}</Text>
            ) : error ? (
                <Text style={styles.error}>{error}</Text>
            ) : (
                <Text>Testing connection...</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    success: {
        color: 'green',
    },
    error: {
        color: 'red',
    },
});

export default TestConnection; 