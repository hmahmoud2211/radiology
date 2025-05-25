import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Colors from '@/constants/colors';
import { ICD11Code } from '@/types';

interface ICD11AutocompleteInputProps {
  value: string;
  onChange: (code: ICD11Code) => void;
  placeholder?: string;
  style?: any;
}

const ICD11AutocompleteInput: React.FC<ICD11AutocompleteInputProps> = ({
  value,
  onChange,
  placeholder = 'Search ICD-11 codes...',
  style,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<ICD11Code[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchICD11 = async () => {
      if (searchTerm.length < 3) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://id.who.int/icd/entity/search?q=${encodeURIComponent(searchTerm)}&propertiesToBeSearched=Title&propertiesToBeSearched=Definition&useFlexisearch=false&flatResults=true&highlightingEnabled=false`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch ICD-11 codes');
        }

        const data = await response.json();
        const formattedSuggestions: ICD11Code[] = data.destinationEntities.map((entity: any) => ({
          code: entity.code,
          title: entity.title,
          description: entity.definition,
        }));

        setSuggestions(formattedSuggestions);
      } catch (err) {
        setError('Failed to fetch ICD-11 codes');
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchICD11, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleSelect = (code: ICD11Code) => {
    onChange(code);
    setSearchTerm(code.title);
    setSuggestions([]);
  };

  return (
    <View style={[styles.container, style]}>
      <TextInput
        style={styles.input}
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder={placeholder}
        placeholderTextColor={Colors.darkGray}
      />
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
      {suggestions.length > 0 && (
        <FlatList
          style={styles.suggestionsList}
          data={suggestions}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => handleSelect(item)}
            >
              <Text style={styles.codeText}>{item.code}</Text>
              <Text style={styles.titleText}>{item.title}</Text>
              {item.description && (
                <Text style={styles.descriptionText} numberOfLines={2}>
                  {item.description}
                </Text>
              )}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  loadingContainer: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    marginTop: 4,
  },
  suggestionsList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: Colors.card,
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 300,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  codeText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  titleText: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.subtext,
  },
});

export default ICD11AutocompleteInput; 