import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ChatScreen () {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Chat Screen</Text>
            {/* Add your chat components here */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
    },
});
