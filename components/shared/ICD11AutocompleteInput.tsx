import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Text, TouchableOpacity, FlatList, StyleSheet, Keyboard, Platform, UIManager, findNodeHandle, ScrollView } from 'react-native';
import { Portal } from 'react-native-paper';
import { ICD11Entry } from '@/types';
// import icd11Data from '@/../mocks/icd11.json';
const icd11Data: ICD11Entry[] = require('../../mocks/icd11.json');

interface ICD11AutocompleteInputProps {
  value: string;
  onSelect: (entry: ICD11Entry | string) => void;
  placeholder?: string;
  dataset?: ICD11Entry[];
}

const MAX_SUGGESTIONS = 8;

function rankICD11Suggestions(query: string, entries: ICD11Entry[]): ICD11Entry[] {
  if (!query) return entries.slice(0, MAX_SUGGESTIONS);
  const q = query.trim().toLowerCase();
  return entries
    .map(entry => {
      const code = entry.code.toLowerCase();
      const name = entry.name.toLowerCase();
      const desc = entry.description.toLowerCase();
      let score = 0;
      if (code.startsWith(q)) score += 100;
      else if (code.includes(q)) score += 60;
      if (name.startsWith(q)) score += 90;
      else if (name.includes(q)) score += 50;
      if (desc.includes(q)) score += 10;
      return { ...entry, _score: score };
    })
    .filter(e => e._score > 0)
    .sort((a, b) => b._score - a._score)
    .slice(0, MAX_SUGGESTIONS);
}

const ICD11AutocompleteInput: React.FC<ICD11AutocompleteInputProps> = ({ value, onSelect, placeholder, dataset }) => {
  const [input, setInput] = useState(value || '');
  const [suggestions, setSuggestions] = useState<ICD11Entry[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [selected, setSelected] = useState<ICD11Entry | null>(null);
  const inputRef = useRef<TextInput>(null);
  const [inputLayout, setInputLayout] = useState<{ x: number; y: number; width: number; height: number }>({ x: 0, y: 0, width: 0, height: 0 });
  const containerRef = useRef<View>(null);

  // Use custom dataset if provided, otherwise default ICD-11
  const dataSource = dataset && dataset.length > 0 ? dataset : icd11Data;

  useEffect(() => {
    setInput(value || '');
    if (!value) setSelected(null);
  }, [value]);

  useEffect(() => {
    if (input.trim() && !selected) {
      const ranked = rankICD11Suggestions(input, dataSource);
      setSuggestions(ranked);
      setShowDropdown(ranked.length > 0);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, [input, selected, dataset]);

  // Measure input position for dropdown
  const handleInputLayout = () => {
    if (containerRef.current) {
      containerRef.current.measureInWindow((x, y, width, height) => {
        setInputLayout({ x, y, width, height });
      });
    }
  };

  const handleSelect = (entry: ICD11Entry) => {
    setInput(`${entry.code} - ${entry.name}`);
    setSelected(entry);
    setShowDropdown(false);
    Keyboard.dismiss();
    onSelect(entry);
  };

  const handleInputChange = (text: string) => {
    setInput(text);
    setSelected(null);
    setShowDropdown(true);
    onSelect(text); // Allow free text
  };

  const handleClear = () => {
    setInput('');
    setSelected(null);
    setShowDropdown(false);
    onSelect('');
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    if (!selected && suggestions.length > 0) setShowDropdown(true);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowDropdown(false);
    }, 120);
  };

  const handleKeyPress = (e: any) => {
    if (!showDropdown || suggestions.length === 0) return;
    if (e.nativeEvent.key === 'ArrowDown') {
      setHighlighted(h => Math.min(h + 1, suggestions.length - 1));
    } else if (e.nativeEvent.key === 'ArrowUp') {
      setHighlighted(h => Math.max(h - 1, 0));
    } else if (e.nativeEvent.key === 'Enter') {
      handleSelect(suggestions[highlighted]);
    }
  };

  const renderSuggestion = ({ item, index }: { item: ICD11Entry; index: number }) => (
    <React.Fragment key={item.code}>
      <TouchableOpacity
        style={[
          styles.suggestion,
          highlighted === index && styles.suggestionHighlighted,
          { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 18, backgroundColor: '#fff' }
        ]}
        activeOpacity={0.7}
        onPress={() => handleSelect(item)}
        accessible accessibilityRole="button"
      >
        <View style={{ width: 80, alignItems: 'flex-start', justifyContent: 'center', marginRight: 18 }}>
          <Text style={styles.suggestionCode}>{item.code}</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={styles.suggestionName}>{item.name}</Text>
          <Text style={styles.suggestionDesc}>{item.description}</Text>
        </View>
      </TouchableOpacity>
      {index < suggestions.length - 1 && <View style={styles.suggestionDivider} />}
    </React.Fragment>
  );

  return (
    <View style={styles.root} ref={containerRef} onLayout={handleInputLayout}>
      <View style={{ flexDirection: 'row', alignItems: 'center', position: 'relative' }}>
        <TextInput
          ref={inputRef}
          style={[styles.input, selected ? styles.inputSelected : null]}
          value={selected ? `${selected.code} - ${selected.name}` : input}
          onChangeText={handleInputChange}
          placeholder={placeholder || 'Type ICD-11 code or diagnosis...'}
          autoCorrect={false}
          autoCapitalize="none"
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyPress={handleKeyPress}
          multiline
          accessibilityLabel="ICD-11 diagnosis autocomplete"
        />
        {(input.length > 0 || selected) && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton} accessibilityLabel="Clear">
            <Text style={{ fontSize: 18, color: '#FFA000' }}>×</Text>
          </TouchableOpacity>
        )}
      </View>
      {showDropdown && suggestions.length > 0 && !selected && (
        <View
          style={[
            styles.dropdown,
            {
              zIndex: 9999,
              elevation: 20,
            },
          ]}
          pointerEvents="box-none"
        >
          <ScrollView style={{ maxHeight: 260 }}>
            {suggestions.map((item, index) => (
              <React.Fragment key={item.code}>
                {renderSuggestion({ item, index })}
              </React.Fragment>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    position: 'relative',
    zIndex: 1000,
  },
  input: {
    backgroundColor: '#FFF8E1',
    borderColor: '#FFD54F',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    minHeight: 60,
    flex: 1,
  },
  inputSelected: {
    borderColor: '#FFA000',
    backgroundColor: '#FFF3E0',
    shadowColor: '#FFA000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  clearButton: {
    position: 'absolute',
    right: 10,
    top: 18,
    zIndex: 30,
    backgroundColor: 'transparent',
    padding: 4,
  },
  dropdown: {
    position: 'absolute',
    top: 68,
    left: 0,
    right: 0,
    backgroundColor: '#FAFAFA',
    borderColor: '#FFD54F',
    borderWidth: 1,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 12,
    zIndex: 2000,
    paddingVertical: 4,
    marginTop: 2,
    maxHeight: 260,
  },
  suggestion: {
    borderBottomWidth: 0,
    backgroundColor: 'white',
    gap: 10,
  },
  suggestionHighlighted: {
    backgroundColor: '#FFF3E0',
  },
  suggestionDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 18,
    marginRight: 0,
  },
  suggestionCode: {
    fontWeight: 'bold',
    color: '#FFA000',
    marginRight: 0,
    minWidth: 70,
    fontSize: 16,
    alignSelf: 'center',
    textAlign: 'left',
  },
  suggestionName: {
    fontWeight: '700',
    color: '#222',
    fontSize: 17,
    marginBottom: 2,
  },
  suggestionDesc: {
    color: '#888',
    fontSize: 13,
    marginTop: 2,
  },
});

export default ICD11AutocompleteInput; 