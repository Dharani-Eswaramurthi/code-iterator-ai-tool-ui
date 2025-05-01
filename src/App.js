import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import axios from 'axios';
import {
  Box,
  Flex,
  Textarea,
  Button,
  Spinner,
  Tooltip,
  IconButton,
  Select,
  useColorModeValue,
  Text,
} from '@chakra-ui/react';
import { InfoOutlineIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import './App.css';

const initialCodeMap = {
  cpp: '// paste your C++ game code here',
  python: '# paste your Python game code here',
  javascript: '// paste your JavaScript game code here',
  java: '// paste your Java game code here',
  typescript: '// paste your TypeScript game code here',
  csharp: '// paste your C# game code here',
  go: '// paste your Go game code here',
  rust: '// paste your Rust game code here',
  php: '<?php // paste your PHP game code here',
  ruby: '# paste your Ruby game code here',
  swift: '// paste your Swift game code here',
  kotlin: '// paste your Kotlin game code here',
  scala: '// paste your Scala game code here',
  plaintext: '// paste your text here',
};

export default function App() {
  const [code, setCode] = useState(initialCodeMap['cpp']);
  const [prompt, setPrompt] = useState('');
  const [inlineSuggestion, setInlineSuggestion] = useState('');
  const [explanation, setExplanation] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [selection, setSelection] = useState(null);
  const [suggestionRange, setSuggestionRange] = useState(null);
  const [hasSelection, setHasSelection] = useState(false);
  const editorRef = useRef(null);
  const [decorations, setDecorations] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(initialCodeMap[lang] || '');
    setInlineSuggestion('');
    setExplanation('');
  };

  const handleEditorSelectionChange = () => {
    const editor = editorRef.current;
    if (!editor) return;
    
    const selection = editor.getSelection();
    const hasSelection = !selection.isEmpty();
    setHasSelection(hasSelection);
    setSelection(selection);
  };

  const insertSuggestion = (suggestion) => {
    const editor = editorRef.current;
    const model = editor.getModel();
    const monaco = window.monaco;
    const currentSelection = editor.getSelection();
    const endLine = currentSelection.endLineNumber;

    const suggestionText = `\n// --- SUGGESTION START ---\n${suggestion}\n// --- SUGGESTION END ---\n`;
    const suggestionLines = suggestionText.split('\n').length;
    
    const edits = [{
      range: new monaco.Range(endLine + 1, 1, endLine + 1, 1),
      text: suggestionText,
      forceMoveMarkers: true
    }];
    
    model.applyEdits(edits);
    
    // Calculate exact inserted range
    const startLine = endLine + 1;
    const endLineAfterInsert = startLine + suggestionLines - 1;
    setSuggestionRange({ start: startLine, end: endLineAfterInsert });
  };

  const handleSuggest = async () => {
    setLoading(true);
    try {
      const editor = editorRef.current;
      const selectedCode = editor.getModel().getValueInRange(selection);
      
      const resp = await axios.post('http://localhost:8000/suggest', {
        code: selectedCode,
        prompt,
        language: language.toLowerCase()
      });

      setInlineSuggestion(resp.data.improved_code);
      setExplanation(resp.data.explanation);
      insertSuggestion(resp.data.improved_code);
    } catch (e) {
      setInlineSuggestion('');
      setExplanation('Failed to get suggestion');
    }
    setLoading(false);
  };

  const handleAccept = () => {
    const editor = editorRef.current;
    const model = editor.getModel();
    const monaco = window.monaco;

    // First replace original selection
    model.applyEdits([{
      range: selection,
      text: inlineSuggestion,
      forceMoveMarkers: true
    }]);

    // Then delete suggestion block
    model.applyEdits([{
      range: new monaco.Range(suggestionRange.start, 1, suggestionRange.end, 1),
      text: '',
      forceMoveMarkers: true
    }]);

    setInlineSuggestion('');
    setExplanation('');
    setSuggestionRange(null);
  };

  const handleReject = () => {
    const editor = editorRef.current;
    const model = editor.getModel();
    const monaco = window.monaco;

    model.applyEdits([{
      range: new monaco.Range(suggestionRange.start, 1, suggestionRange.end, 1),
      text: '',
      forceMoveMarkers: true
    }]);

    setInlineSuggestion('');
    setExplanation('');
    setSuggestionRange(null);
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.onDidChangeCursorSelection(handleEditorSelectionChange);
    
    monaco.editor.defineTheme('suggestion-theme', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editorSuggestWidget.background': '#f0fff4',
        'editorSuggestWidget.border': '#38a169'
      }
    });
  };

  useEffect(() => {
    if (!editorRef.current || !suggestionRange) return;
    
    const monaco = window.monaco;
    const newDecorations = editorRef.current.deltaDecorations([], [
      {
        range: new monaco.Range(suggestionRange.start + 1, 1, suggestionRange.end - 1, 1),
        options: {
          isWholeLine: true,
          className: 'suggestion-highlight',
          hoverMessage: { value: explanation }
        }
      }
    ]);
    
    setDecorations(newDecorations);
  }, [suggestionRange, explanation]);

  return (
    <Box p={0} m={0} bg="gray.100" minH="100vh" minW="100vw" fontFamily="font-editor">
      <Box w="100vw" h="100vh" bg="white" p={0} m={0}>
        <Box as="h2" fontSize="2xl" fontWeight="bold" px={8} pt={8}>
          Code Iterator (Selection Mode)
        </Box>
        <Flex gap={6} px={8} pb={8} h="calc(100vh - 80px)">
          <Box flex="1" minW={0} h="100%">
            <Select
              value={language}
              onChange={handleLanguageChange}
              width="200px"
              mb={4}
              fontFamily="'JetBrains Mono', monospace"
              borderColor="gray.300"
            >
              {Object.keys(initialCodeMap).map(lang => (
                <option key={lang} value={lang}>{lang.toUpperCase()}</option>
              ))}
            </Select>
            
            <Box
              position="relative"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="md"
              h="calc(100% - 60px)"
            >
              <Editor
                height="100%"
                language={language}
                value={code}
                onChange={setCode}
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbersMinChars: 3,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  theme: 'suggestion-theme',
                }}
              />
              
              <Text fontSize="sm" color="gray.500" mt={2} px={2}>
                {hasSelection ? "✏️ Code selected" : "⬆️ Select code to begin"}
              </Text>
            </Box>
            
            {suggestionRange && (
              <Flex gap={3} mt={4} justify="flex-end">
                <Tooltip label={explanation} placement="top" hasArrow>
                  <IconButton
                    icon={<InfoOutlineIcon />}
                    aria-label="Explanation"
                    variant="ghost"
                    colorScheme="blue"
                  />
                </Tooltip>
                <Button
                  leftIcon={<CheckIcon />}
                  colorScheme="green"
                  onClick={handleAccept}
                >
                  Accept Changes
                </Button>
                <Button
                  leftIcon={<CloseIcon />}
                  colorScheme="red"
                  variant="outline"
                  onClick={handleReject}
                >
                  Discard
                </Button>
              </Flex>
            )}
          </Box>

          <Flex direction="column" flex="1" minW={0} h="100%" gap={4}>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your desired changes..."
              isDisabled={!hasSelection}
              fontFamily="'JetBrains Mono', monospace"
              bg="gray.50"
              _disabled={{ opacity: 0.6, cursor: 'not-allowed' }}
              height="150px"
            />
            
            <Button
              colorScheme="blue"
              isLoading={loading}
              loadingText="Generating..."
              onClick={handleSuggest}
              isDisabled={!hasSelection || !prompt.trim()}
            >
              Get Improvement Suggestions
            </Button>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
}