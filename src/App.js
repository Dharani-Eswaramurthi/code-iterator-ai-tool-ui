import React, { useState, useRef } from 'react';
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
} from '@chakra-ui/react';
import { InfoOutlineIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import './App.css';

// Map for initial code templates by language
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

  const handleSuggest = async () => {
    setLoading(true);
    try {
      const langParam = language.toLowerCase().replace(/\s/g, '');
      const resp = await axios.post('http://localhost:8000/suggest', { code, prompt, language: langParam });
      setInlineSuggestion(resp.data.improved_code);
      setExplanation(resp.data.explanation);
    } catch (e) {
      setInlineSuggestion('');
      setExplanation('Failed to get suggestion from API.');
    }
    setLoading(false);
  };

  const handleIntegrate = async () => {
    setCode(inlineSuggestion);
    setInlineSuggestion('');
    setExplanation('');
  };

  const handleReject = () => {
    setInlineSuggestion('');
    setExplanation('');
  };

  const getEditorValue = () => {
    if (!inlineSuggestion) return code;
    return (
      code +
      '\n\n// --- Copilot Suggestion ---\n' +
      inlineSuggestion
    );
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    if (inlineSuggestion) {
      highlightBlocks(editor, monaco);
    }
  };

  const highlightBlocks = (editor, monaco) => {
    const codeLines = code.split('\n').length;
    const suggestionLines = inlineSuggestion.split('\n').length + 1;
    const startSuggestion = codeLines + 2;
    const endSuggestion = startSuggestion + suggestionLines - 1;

    const newDecorations = editor.deltaDecorations(
      decorations,
      [
        {
          range: new monaco.Range(1, 1, codeLines, 1),
          options: {
            isWholeLine: true,
            className: 'editor-original-highlight'
          }
        },
        {
          range: new monaco.Range(startSuggestion, 1, endSuggestion, 1),
          options: {
            isWholeLine: true,
            className: 'editor-suggestion-highlight'
          }
        }
      ]
    );
    setDecorations(newDecorations);
  };

  React.useEffect(() => {
    if (editorRef.current && inlineSuggestion) {
      const monaco = window.monaco || (window.require && window.require('monaco-editor'));
      if (monaco) {
        highlightBlocks(editorRef.current, monaco);
      }
    }
    if (editorRef.current && !inlineSuggestion) {
      editorRef.current.deltaDecorations(decorations, []);
      setDecorations([]);
    }
  }, [inlineSuggestion]);

  const renderChakraOverlay = () => {
    if (!inlineSuggestion) return null;
    return (
      <Flex
        position="absolute"
        bottom="18px"
        right="24px"
        zIndex={30}
        align="center"
        gap={3}
      >
        <Tooltip label={explanation} placement="top" hasArrow>
          <IconButton
            icon={<InfoOutlineIcon />}
            aria-label="Suggestion Explanation"
            variant="ghost"
            colorScheme="blue"
            fontSize="xl"
            size="lg"
            borderRadius="full"
          />
        </Tooltip>
        <Button
          leftIcon={<CheckIcon />}
          colorScheme="green"
          variant="solid"
          borderRadius="lg"
          fontWeight="bold"
          onClick={handleIntegrate}
        >
          Accept
        </Button>
        <Button
          leftIcon={<CloseIcon />}
          colorScheme="red"
          variant="outline"
          borderRadius="lg"
          fontWeight="bold"
          onClick={handleReject}
        >
          Reject
        </Button>
      </Flex>
    );
  };

  // Place the action bar below the editor, spanning the full width
  const renderChakraActionBar = () => {
    if (!inlineSuggestion) return null;
    return (
      <Flex
        w="100%"
        mt={3}
        px={2}
        py={3}
        align="center"
        justify="flex-end"
        bg="gray.50"
        borderRadius="md"
        border="1px solid"
        borderColor="gray.200"
        boxShadow="sm"
        gap={4}
      >
        <Tooltip label={explanation} placement="top" hasArrow>
          <IconButton
            icon={<InfoOutlineIcon />}
            aria-label="Suggestion Explanation"
            variant="ghost"
            colorScheme="blue"
            fontSize="xl"
            size="lg"
            borderRadius="full"
          />
        </Tooltip>
        <Button
          leftIcon={<CheckIcon />}
          colorScheme="green"
          variant="solid"
          borderRadius="lg"
          fontWeight="bold"
          onClick={handleIntegrate}
        >
          Accept
        </Button>
        <Button
          leftIcon={<CloseIcon />}
          colorScheme="red"
          variant="outline"
          borderRadius="lg"
          fontWeight="bold"
          onClick={handleReject}
        >
          Reject
        </Button>
      </Flex>
    );
  };

  return (
    <Box p={0} m={0} bg="gray.100" minH="100vh" minW="100vw" fontFamily="font-editor" transition="all 0.3s">
      <Box w="100vw" h="100vh" boxShadow="none" rounded="none" bg="white" p={0} m={0}>
        <Box as="h2" fontSize="2xl" fontWeight="bold" mb={4} fontFamily="font-editor" transition="all 0.3s" px={8} pt={8}>
          Code Iterator POC (HF)
        </Box>
        <Flex gap={6} px={8} pb={8} h="calc(100vh - 80px)">
          <Box
            flex="1"
            minW={0}
            display="flex"
            flexDirection="column"
            h="100%"
          >
            <Box mb={2}>
              <Select
                value={language}
                onChange={handleLanguageChange}
                width="200px"
                mb={2}
                fontFamily="'JetBrains Mono', 'Fira Mono', 'Menlo', 'monospace'"
              >
                <option value="cpp">C++</option>
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
                <option value="typescript">TypeScript</option>
                <option value="csharp">C#</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
                <option value="php">PHP</option>
                <option value="ruby">Ruby</option>
                <option value="swift">Swift</option>
                <option value="kotlin">Kotlin</option>
                <option value="scala">Scala</option>
                <option value="plaintext">Plain Text</option>
              </Select>
            </Box>
            <Box
              position="relative"
              rounded="lg"
              overflow="hidden"
              border="1px solid"
              borderColor="gray.300"
              boxShadow="sm"
              flex="1"
              minH="45vh"
              h="100%"
              transition="all 0.3s"
            >
              <Editor
                height="100%"
                defaultLanguage={language}
                language={language}
                value={getEditorValue()}
                onChange={v => setCode(v)}
                options={{
                  readOnly: false,
                  fontFamily: "'JetBrains Mono', 'Fira Mono', 'Menlo', 'monospace'",
                  fontSize: 16,
                  lineHeight: 1.7,
                  minimap: { enabled: false },
                  smoothScrolling: true,
                  scrollBeyondLastLine: false,
                  cursorSmoothCaretAnimation: true,
                  renderLineHighlight: 'all',
                  padding: { top: 16, bottom: 16 },
                  wordWrap: 'on',
                  scrollbar: {
                    verticalScrollbarSize: 8,
                    horizontalScrollbarSize: 8,
                    alwaysConsumeMouseWheel: false,
                  },
                  theme: 'vs',
                }}
                onMount={handleEditorDidMount}
              />
            </Box>
            {renderChakraActionBar()}
          </Box>
          <Flex direction="column" flex="1" minW={0} h="100%">
            <Flex
              direction="column"
              gap={4}
              mb={4}
              as="form"
              h="100%"
              onSubmit={e => {
                e.preventDefault();
                if (!loading && prompt.trim()) handleSuggest();
              }}
            >
              <Textarea
                className="modern-textarea"
                rows={5}
                placeholder="Describe desired changes..."
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                isDisabled={loading}
                fontFamily="'JetBrains Mono', 'Fira Mono', 'Menlo', 'monospace'"
                fontSize="1.1rem"
                bg={useColorModeValue('gray.50', 'gray.700')}
                borderColor={useColorModeValue('gray.300', 'gray.600')}
                _focus={{
                  borderColor: 'blue.600',
                  bg: 'white',
                  boxShadow: '0 4px 16px 0 rgba(37,99,235,0.08)'
                }}
                resize="vertical"
                transition="all 0.2s"
                flex="1"
                minH="0"
              />
              <Button
                alignSelf="flex-end"
                bgGradient="linear(to-r, blue.600, blue.800)"
                color="white"
                fontWeight="bold"
                fontSize="1.1rem"
                borderRadius="lg"
                px={10}
                py={3}
                minW="180px"
                boxShadow="sm"
                _hover={{
                  bgGradient: "linear(to-r, blue.800, blue.600)",
                  transform: "translateY(-2px) scale(1.03)",
                  boxShadow: "0 6px 24px 0 rgba(37,99,235,0.12)"
                }}
                _active={{}}
                isLoading={loading}
                spinner={<Spinner color="white" size="md" />}
                onClick={handleSuggest}
                isDisabled={loading || !prompt.trim()}
                type="submit"
                transition="all 0.2s"
              >
                Suggest Improvements
              </Button>
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
}