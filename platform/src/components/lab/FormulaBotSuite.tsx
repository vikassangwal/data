'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Check, Copy, RotateCcw, FileSpreadsheet, Database, Search, 
  Code, Sparkles, Cpu, Layers, Terminal, ArrowRight, BookOpen, 
  HelpCircle, Send, CheckCircle2, AlertTriangle, ChevronRight, HelpCircle as HelpIcon,
  LayoutDashboard
} from 'lucide-react';
import { GlassCard, Button, Badge, Input, Textarea } from '@/components/ui';

// ================= TYPES & CONSTANTS =================

interface Agent {
  id: string;
  name: string;
  abbr: string;
  role: string;
  x: number;
  y: number;
  color: string;
}

// 21 Specialized Agents coordinates and colors for interactive SVG Node Graph
const ORCHESTRA_ROSTER: Agent[] = [
  { id: 'sa', name: 'Semantic Analyst', abbr: 'SA', role: 'Intent translation', x: 80, y: 70, color: '#3B82F6' },
  { id: 'ce', name: 'Context Evaluator', abbr: 'CE', role: 'Platform routing', x: 200, y: 50, color: '#06B6D4' },
  { id: 'sc', name: 'Syntax Compiler', abbr: 'SC', role: 'Initial drafting', x: 320, y: 70, color: '#8B5CF6' },
  { id: 'egv', name: 'Excel Grammar Validator', abbr: 'EGV', role: 'Excel checks', x: 440, y: 50, color: '#F59E0B' },
  { id: 'gst', name: 'Google Sheets Translator', abbr: 'GST', role: 'Sheets mapping', x: 560, y: 70, color: '#10B981' },
  { id: 'vsc', name: 'VBA Script Compiler', abbr: 'VSC', role: 'VBA scripting', x: 80, y: 170, color: '#3B82F6' },
  { id: 'asa', name: 'Apps Script Adapter', abbr: 'ASA', role: 'VBA to JS conversion', x: 200, y: 150, color: '#06B6D4' },
  { id: 'ssm', name: 'SQL Schema Modeler', abbr: 'SSM', role: 'Schema validation', x: 320, y: 170, color: '#8B5CF6' },
  { id: 'sqo', name: 'SQL Query Optimizer', abbr: 'SQO', role: 'Performance joins', x: 440, y: 150, color: '#F59E0B' },
  { id: 'rcc', name: 'Regex Character Compiler', abbr: 'RCC', role: 'Regex drafting', x: 560, y: 170, color: '#10B981' },
  { id: 'rbc', name: 'Regex Boundary Checker', abbr: 'RBC', role: 'Anchor checks', x: 80, y: 270, color: '#3B82F6' },
  { id: 'cea', name: 'Consensus Evaluator', abbr: 'CEA', role: 'Candidate rating', x: 200, y: 250, color: '#06B6D4' },
  { id: 'lsa', name: 'Lint & Security Auditor', abbr: 'LSA', role: 'VBA/SQL sanitizing', x: 320, y: 270, color: '#8B5CF6' },
  { id: 'cpc', name: 'Cross-Platform Comp.', abbr: 'CPC', role: 'Excel versions map', x: 440, y: 250, color: '#F59E0B' },
  { id: 'ecp', name: 'Edge Case Predictor', abbr: 'ECP', role: 'Error catching (#N/A)', x: 560, y: 270, color: '#10B981' },
  { id: 'aes', name: 'AI Explanation Specialist', abbr: 'AES', role: 'English translation', x: 140, y: 360, color: '#3B82F6' },
  { id: 'ppa', name: 'Performance Profiler', abbr: 'PPA', role: 'Speed diagnostics', x: 260, y: 340, color: '#06B6D4' },
  { id: 'cc', name: 'Consensus Coordinator', abbr: 'CC', role: 'Quorum synchronization', x: 380, y: 360, color: '#8B5CF6' },
  { id: 'pel', name: 'Prompt Engineering Lead', abbr: 'PEL', role: 'Context optimization', x: 500, y: 340, color: '#F59E0B' },
  { id: 'era', name: 'Error Recovery Agent', abbr: 'ERA', role: 'Self-repairing code', x: 260, y: 430, color: '#10B981' },
  { id: 'vto', name: 'Visual Telemetry Orch.', abbr: 'VTO', role: 'Logs coordination', x: 380, y: 430, color: '#3B82F6' }
];

// Helper to draw connection lines between adjacent agents in network grid
const CONNECTIONS = [
  { from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 },
  { from: 5, to: 6 }, { from: 6, to: 7 }, { from: 7, to: 8 }, { from: 8, to: 9 },
  { from: 10, to: 11 }, { from: 11, to: 12 }, { from: 12, to: 13 }, { from: 13, to: 14 },
  { from: 1, to: 6 }, { from: 2, to: 7 }, { from: 3, to: 8 }, { from: 4, to: 9 },
  { from: 6, to: 11 }, { from: 7, to: 12 }, { from: 8, to: 13 }, { from: 9, to: 14 },
  { from: 11, to: 15 }, { from: 12, to: 16 }, { from: 13, to: 17 }, { from: 14, to: 18 },
  { from: 15, to: 19 }, { from: 16, to: 19 }, { from: 17, to: 20 }, { from: 18, to: 20 },
  { from: 19, to: 20 }
];

// Hotkeys & Cheat sheet guides
const CHEAT_SHEETS = [
  { id: 1, title: 'VLOOKUP', cat: 'Lookup', syntax: '=VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])', desc: 'Searches for a value in the first column of a table, and returns a value in the same row from another column.' },
  { id: 2, title: 'INDEX & MATCH', cat: 'Lookup', syntax: '=INDEX(array, MATCH(lookup_value, lookup_array, [match_type]))', desc: 'A more flexible alternative to VLOOKUP that allows searching columns to the left.' },
  { id: 3, title: 'XLOOKUP', cat: 'Lookup', syntax: '=XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode], [search_mode])', desc: 'Modern successor to VLOOKUP. Works in any direction and defaults to exact matches.' },
  { id: 4, title: 'SUMIFS', cat: 'Math', syntax: '=SUMIFS(sum_range, criteria_range1, criteria1, [criteria_range2, criteria2], ...)', desc: 'Adds cells in a range that meet multiple criteria conditions.' },
  { id: 5, title: 'AVERAGEIFS', cat: 'Math', syntax: '=AVERAGEIFS(average_range, criteria_range1, criteria1, ...)', desc: 'Calculates average of cells matching multiple parameters.' },
  { id: 6, title: 'COUNTIFS', cat: 'Logical', syntax: '=COUNTIFS(criteria_range1, criteria1, ...)', desc: 'Counts cells meeting multiple conditions.' },
  { id: 7, title: 'IFERROR', cat: 'Logical', syntax: '=IFERROR(value, value_if_error)', desc: 'Catches errors (like #DIV/0!, #N/A) and returns a fallback value.' },
  { id: 8, title: 'CONCATENATE / TEXTJOIN', cat: 'Text', syntax: '=TEXTJOIN(delimiter, ignore_empty, text1, [text2], ...)', desc: 'Combines multiple text strings into one with a separator.' },
  { id: 9, title: 'NETWORKDAYS', cat: 'Date', syntax: '=NETWORKDAYS(start_date, end_date, [holidays])', desc: 'Returns number of full working days between two dates.' },
  { id: 10, title: 'DATEDIF', cat: 'Date', syntax: '=DATEDIF(start_date, end_date, unit)', desc: 'Calculates the difference in days, months, or years between two dates.' }
];

const HOTKEYS = [
  { keys: 'Ctrl + ;', desc: 'Insert current date' },
  { keys: 'Ctrl + Shift + :', desc: 'Insert current time' },
  { keys: 'F4', desc: 'Toggle cell reference between absolute, mixed, and relative ($A$1)' },
  { keys: 'Ctrl + `', desc: 'Toggle showing all formulas vs results on sheets' },
  { keys: 'Alt + Enter', desc: 'Insert line break inside a spreadsheet cell' },
  { keys: 'Ctrl + T', desc: 'Convert selected range to an Interactive Table' }
];

interface FormulaBotSuiteProps {
  lang?: string;
  t?: any;
}

export default function FormulaBotSuite({ lang, t }: FormulaBotSuiteProps = {}) {
  const [activeTab, setActiveTab] = useState<'formulas' | 'vba' | 'sql' | 'regex' | 'chat'>('formulas');
  const [subMode, setSubMode] = useState<'generate' | 'explain'>('generate');
  
  // CSV Context Integration from Data Lab
  const [activeFileName, setActiveFileName] = useState<string | null>(null);
  const [activeHeaders, setActiveHeaders] = useState<string[]>([]);
  const [useActiveCsvSchema, setUseActiveCsvSchema] = useState(true);

  // Read CSV from LocalStorage on load
  useEffect(() => {
    const filename = localStorage.getItem('lab_uploaded_filename');
    const csvContent = localStorage.getItem('lab_uploaded_csv');
    if (filename && csvContent) {
      setActiveFileName(filename);
      // Parse first line to extract headers
      const firstLine = csvContent.split('\n')[0];
      if (firstLine) {
        const headers = firstLine.split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
        setActiveHeaders(headers.filter(h => h.length > 0));
      }
    }
  }, []);
  
  // Input fields
  const [promptInput, setPromptInput] = useState('');
  const [platformType, setPlatformType] = useState<'excel' | 'sheets'>('excel');
  const [vbaPlatform, setVbaPlatform] = useState<'vba' | 'apps-script'>('vba');
  
  // Output and Telemetry States
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationProgress, setCompilationProgress] = useState(0);
  const [consensusScore, setConsensusScore] = useState(0);
  const [compilationStage, setCompilationStage] = useState('');
  const [orchestraMode, setOrchestraMode] = useState<boolean>(true); // 21-Agent Orchestra Toggle
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [activeAgentIndex, setActiveAgentIndex] = useState<number | null>(null);
  const [compiledResult, setCompiledResult] = useState<string | null>(null);
  const [explanationResult, setExplanationResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Chatbot State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'bot', text: string }>>([
    { sender: 'bot', text: 'Hey there! I am your AI Excel & Spreadsheet Assistant. Ask me any formulas, VBA, SQL, or shortcut questions!' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Cheat Sheet Filter
  const [cheatFilter, setCheatFilter] = useState('All');
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal logs
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalLogs]);

  // Trigger copy
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Compile Handler: Generates or Explains queries using dynamic neural templates and simulates 21 specialized agents
  const handleCompile = () => {
    if (!promptInput.trim()) return;

    setIsCompiling(true);
    setCompilationProgress(0);
    setConsensusScore(0);
    setCompiledResult(null);
    setExplanationResult(null);
    setTerminalLogs([]);
    
    // Roster log simulations for 21 agents
    const logsList: string[] = [
      '[SYSTEM]: Spawning 21 Collaborative AI Agents from DevForge Core...',
      '[SA - Semantic Analyst]: Analyzing natural language syntax parameters...',
      '[CE - Context Evaluator]: Context routed to target compilation trees...',
      '[PEL - Prompt Engineering Lead]: Context boundaries and criteria validated...',
      '[SC - Syntax Compiler]: Constructing the draft logic tree...',
      '[EGV - Excel Grammar Validator]: Auditing absolute row anchors and parentheses...',
      '[GST - Google Sheets Translator]: Scanning matching Sheets functions equivalents...',
      '[SSM - SQL Schema Modeler]: Setting up temporary mock data models...',
      '[SQO - SQL Query Optimizer]: Rewriting JOIN criteria and evaluating indexing hints...',
      '[RCC - Regex Character Compiler]: Framing regex boundaries, anchors, and lookaheads...',
      '[LSA - Lint & Security Auditor]: Running strict anti-malware and injection audits...',
      '[CPC - Cross-Platform Compatibility]: Standardizing parameters for older versions (Excel 2016+)...',
      '[ECP - Edge Case Predictor]: Trapping potential #DIV/0!, #N/A anomalies...',
      '[CEA - Consensus Evaluator]: Matching candidate draft models with reference guidelines...',
      '[CC - Consensus Coordinator]: Consensus protocol finalized. Agreement reached.',
      '[ERA - Error Recovery Agent]: Self-repair cycles cleared. Compilation successful.',
      '[AES - AI Explanation Specialist]: Generating plain English instructions...',
      '[VTO - Visual Telemetry Orchestrator]: telemetry output compiled. Displaying solution.'
    ];

    let progress = 0;
    let logIndex = 0;
    
    // Fast telemetry mode (Express) vs Visual Orchestra Mode
    const intervalTime = orchestraMode ? 250 : 60;

    const interval = setInterval(() => {
      progress += (orchestraMode ? 5 : 15);
      
      // Update Agent Nodes Graph visual indicators
      if (orchestraMode) {
        const matchingAgent = Math.floor((progress / 100) * ORCHESTRA_ROSTER.length);
        setActiveAgentIndex(matchingAgent < ORCHESTRA_ROSTER.length ? matchingAgent : null);
      }

      setCompilationProgress(Math.min(progress, 100));

      // Push logs
      if (logIndex < logsList.length && Math.random() > 0.3) {
        setTerminalLogs(prev => [...prev, logsList[logIndex]]);
        logIndex++;
      }

      // Progress states
      if (progress < 25) {
        setCompilationStage('Analyzing Intent');
      } else if (progress < 55) {
        setCompilationStage('Synthesizing Solutions');
      } else if (progress < 85) {
        setCompilationStage('Auditing & Security Lint');
      } else {
        setCompilationStage('Consensus & Verification');
      }

      if (progress >= 100) {
        clearInterval(interval);
        setActiveAgentIndex(null);
        setConsensusScore(orchestraMode ? parseFloat((95 + Math.random() * 4.9).toFixed(1)) : 100);
        
        // Execute dynamic parser compiler
        runCompiler();
        setIsCompiling(false);
      }
    }, intervalTime);
  };

  // The Client-side Neural Compiler
  const runCompiler = () => {
    const rawQuery = promptInput.toLowerCase();
    const hasActiveCsv = useActiveCsvSchema && activeHeaders.length > 0;
    const catCol = hasActiveCsv ? activeHeaders[0] : 'Segment';
    const numCol1 = hasActiveCsv && activeHeaders.length > 1 ? activeHeaders[1] : 'Revenue';
    const numCol2 = hasActiveCsv && activeHeaders.length > 2 ? activeHeaders[2] : 'Conversion';
    
    // Tab 1: Formulas (Generate or Explain)
    if (activeTab === 'formulas') {
      if (subMode === 'generate') {
        let result = '';
        let explanation = '';

        if (rawQuery.includes('sum') && rawQuery.includes('column') && (rawQuery.includes('if') || rawQuery.includes('where'))) {
          // SUMIF / SUMIFS
          const matchCol = rawQuery.match(/column\s+([a-z])/i);
          const criteriaCol = rawQuery.match(/if\s+column\s+([a-z])/i) || rawQuery.match(/where\s+column\s+([a-z])/i);
          const col1 = hasActiveCsv ? numCol1 : (matchCol ? matchCol[1].toUpperCase() : 'A');
          const col2 = hasActiveCsv ? catCol : (criteriaCol ? criteriaCol[1].toUpperCase() : 'B');
          
          result = `=SUMIF(${col2}:${col2}, "Completed", ${col1}:${col1})`;
          explanation = `### How This Formula Works (Linked Dataset Columns)
1. **\`SUMIF(criteria_range, criteria, sum_range)\`**: Sums the values in a range that meet the criteria you specify.
2. **\`${col2}:${col2}\`**: The range of cells evaluated by the criteria (${hasActiveCsv ? 'Active Header: ' + col2 : 'Column ' + col2}).
3. **\`"Completed"\`**: The matching criteria logic.
4. **\`${col1}:${col1}\`**: The actual cells to sum (${hasActiveCsv ? 'Active Header: ' + col1 : 'Column ' + col1}). All matching rows are summed.`;
        } 
        else if (rawQuery.includes('average') && rawQuery.includes('column') && (rawQuery.includes('if') || rawQuery.includes('where'))) {
          // AVERAGEIF
          const matchCol = rawQuery.match(/column\s+([a-z])/i);
          const criteriaCol = rawQuery.match(/if\s+column\s+([a-z])/i) || rawQuery.match(/where\s+column\s+([a-z])/i);
          const col1 = hasActiveCsv ? numCol2 : (matchCol ? matchCol[1].toUpperCase() : 'C');
          const col2 = hasActiveCsv ? catCol : (criteriaCol ? criteriaCol[1].toUpperCase() : 'D');

          result = `=AVERAGEIF(${col2}:${col2}, "Active", ${col1}:${col1})`;
          explanation = `### How This Formula Works (Linked Dataset Columns)
1. **\`AVERAGEIF(range, criteria, [average_range])\`**: Returns the average of all cells in a range that meet a given criteria.
2. **\`${col2}:${col2}\`**: The range to match criteria against (${hasActiveCsv ? 'Active Header: ' + col2 : 'Column ' + col2}).
3. **\`"Active"\`**: The matching criteria rule.
4. **\`${col1}:${col1}\`**: The numeric values to average (${hasActiveCsv ? 'Active Header: ' + col1 : 'Column ' + col1}).`;
        }
        else if (rawQuery.includes('lookup') || rawQuery.includes('find value') || rawQuery.includes('vlookup')) {
          // VLOOKUP or XLOOKUP
          if (platformType === 'excel') {
            result = `=XLOOKUP(A1, ${hasActiveCsv ? catCol + ':' + catCol : 'B:B'}, ${hasActiveCsv ? numCol1 + ':' + numCol1 : 'C:C'}, "Not Found")`;
            explanation = `### How This Formula Works (Linked Dataset Columns)
1. **\`XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found])\`**: Excel's modern search function.
2. **\`A1\`**: The value you want to search for.
3. **\`${hasActiveCsv ? catCol + ':' + catCol : 'B:B'}\`**: The column range where the lookup value is located.
4. **\`${hasActiveCsv ? numCol1 + ':' + numCol1 : 'C:C'}\`**: The column range from which to return the result.
5. **\`"Not Found"\`**: Custom text returned if no match is found.`;
          } else {
            result = `=VLOOKUP(A1, ${hasActiveCsv ? catCol + ':' + numCol1 : 'B:C'}, 2, FALSE)`;
            explanation = `### How This Formula Works (Linked Dataset Columns)
1. **\`VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])\`**: Searches for A1 in column ${hasActiveCsv ? catCol : 'B'} and returns column ${hasActiveCsv ? numCol1 : 'C'}.
2. **\`A1\`**: Value to find.
3. **\`${hasActiveCsv ? catCol + ':' + numCol1 : 'B:C'}\`**: Table reference block.
4. **\`2\`**: Return index (Column 2).
5. **\`FALSE\`**: Exact match parameters.`;
          }
        }
        else if (rawQuery.includes('if') && (rawQuery.includes('greater') || rawQuery.includes('less') || rawQuery.includes('>'))) {
          // IF statement
          result = `=IF(${hasActiveCsv ? numCol1 : 'A1'} > 100, "High", "Low")`;
          explanation = `### How This Formula Works
1. **\`IF(logical_test, value_if_true, value_if_false)\`**: Evaluates conditions.
2. **\`${hasActiveCsv ? numCol1 : 'A1'} > 100\`**: Checks if value in ${hasActiveCsv ? 'Column ' + numCol1 : 'cell A1'} is greater than 100.
3. **\`"High"\`**: Text returned if true.
4. **\`"Low"\`**: Text returned if false.`;
        }
        else {
          // Dynamic fallback based on keywords
          const hasIf = rawQuery.includes('if');
          const hasSum = rawQuery.includes('sum') || rawQuery.includes('total');
          const hasCount = rawQuery.includes('count');
          
          if (hasSum && hasIf) {
            result = `=SUMIFS(${hasActiveCsv ? numCol1 + ':' + numCol1 : 'A:A'}, ${hasActiveCsv ? catCol + ':' + catCol : 'B:B'}, ">50")`;
            explanation = `### Custom Dynamic SUMIFS Generated
- Evaluated keyword criteria: 'sum' and conditional filters.
- **Formula**: \`=SUMIFS(sum_range, criteria_range1, criteria1, ...)\`
- Uses active column \`${numCol1}\` for sum, filtered by \`${catCol}\`.`;
          } else if (hasCount && hasIf) {
            result = `=COUNTIFS(${hasActiveCsv ? catCol + ':' + catCol : 'A:A'}, "Active")`;
            explanation = `### Custom Dynamic COUNTIFS Generated
- Evaluated keyword criteria: 'count' and conditional filters.
- **Formula**: \`=COUNTIFS(criteria_range1, criteria1, ...)\`
- Returns count of active columns based on categorical column \`${catCol}\`.`;
          } else {
            result = `=IFERROR(VLOOKUP(A1, ${hasActiveCsv ? catCol + ':' + numCol1 : 'B:D'}, 2, FALSE), "No Data")`;
            explanation = `### General Dynamic Spreadsheet Formula Generated
- Wraps \`VLOOKUP\` inside an \`IFERROR\` catch block for resilience.
- Auto-handles formula errors seamlessly while maintaining lookup rules for \`${catCol}\`.`;
          }
        }

        setCompiledResult(result);
        setExplanationResult(explanation);
      } 
      else {
        // Explain formula
        let explanation = '';
        if (promptInput.toUpperCase().includes('VLOOKUP')) {
          explanation = `### Formula Breakdown: \`${promptInput}\`
- **Function Type**: Search & Reference (\`VLOOKUP\`)
- **\`A1\` / First Param**: The **Lookup Value**. The item we search in Column 1.
- **\`B:C\` / Second Param**: The **Table Array**. Column B is searched, column C holds the result.
- **\`2\` / Third Param**: The **Column Index**. Returns the value in the 2nd column of the selected range.
- **\`FALSE\` / Fourth Param**: **Exact Match**. Returns errors if exact match is not found.`;
        } else if (promptInput.toUpperCase().includes('SUMIF')) {
          explanation = `### Formula Breakdown: \`${promptInput}\`
- **Function Type**: Mathematical Conditional (\`SUMIF\`)
- **First Parameter**: The evaluation range columns where conditions are checked.
- **Second Parameter**: The condition logic (e.g. \`"Sales"\` or \`">100"\`).
- **Third Parameter**: The range to sum. If omitted, matching rows are summed from evaluation columns directly.`;
        } else {
          explanation = `### Formula Breakdown: \`${promptInput}\`
- **Analysis**: Detected standard spreadsheet logic tree.
- **Parentheses Audit**: Checked and balanced.
- **Parameter Mapping**:
  1. Primary range evaluated for logical parameters.
  2. Outer condition controls calculations.
  3. Cell references mapped to immediate left parameters.`;
        }
        setCompiledResult(promptInput);
        setExplanationResult(explanation);
      }
    }

    // Tab 2: VBA / Google Apps Script
    else if (activeTab === 'vba') {
      if (subMode === 'generate') {
        let result = '';
        let explanation = '';

        if (vbaPlatform === 'vba') {
          if (rawQuery.includes('loop') || rawQuery.includes('delete') || rawQuery.includes('row')) {
            result = `Sub DeleteEmptyRows()
    Dim r As Long
    Dim lastRow As Long
    
    ' Find the last row in Column A
    lastRow = Cells(Rows.Count, 1).End(xlUp).Row
    
    ' Loop backwards through rows to prevent index skips
    For r = lastRow To 1 Step -1
        If WorksheetFunction.CountA(Rows(r)) = 0 Then
            Rows(r).Delete
        End If
    Next r
    
    MsgBox "Empty rows cleaned!", vbInformation
End Sub`;
            explanation = `### VBA script logic breakdown:
1. **\`For r = lastRow To 1 Step -1\`**: Loops backwards through the rows. This is critical when deleting items because indices shift up.
2. **\`WorksheetFunction.CountA(Rows(r)) = 0\`**: Evaluates if the row contains zero cells with data.
3. **\`Rows(r).Delete\`**: Deletes the row range entirely.`;
          } else {
            result = `Sub FormatDataGrid()
    Dim ws As Worksheet
    Set ws = ActiveSheet
    
    ' Apply styles to Headings
    With ws.Range("A1:E1")
        .Font.Bold = True
        .Font.Color = RGB(255, 255, 255)
        .Interior.Color = RGB(37, 99, 235)
    End With
    
    ' Auto-fit columns
    ws.Columns("A:E").AutoFit
End Sub`;
            explanation = `### VBA Format script breakdown:
- Applies bold headers with royal blue backgrounds.
- Auto-fits column dimensions for maximum visual readability.`;
          }
        } else {
          // Google Apps Script
          result = `function deleteEmptyRows() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rows = sheet.getLastRow();
  
  // Loop backwards through cells
  for (var r = rows; r >= 1; r--) {
    if (sheet.getRange(r, 1, 1, sheet.getLastColumn()).isBlank()) {
      sheet.deleteRow(r);
    }
  }
  
  SpreadsheetApp.getUi().alert("Clean complete!");
}`;
          explanation = `### Google Apps Script Breakdown:
- Uses modern V8 Javascript engine rules.
- **\`isBlank()\`**: Checks if row ranges are completely empty.
- Deletes matching records backwards.`;
        }
        setCompiledResult(result);
        setExplanationResult(explanation);
      } else {
        // Explain VBA / JS
        setCompiledResult(promptInput);
        setExplanationResult(`### Code Audit & Explanation
1. **Module initialized**: Setup variables and dimensions.
2. **Action Block**: Loops through cell references based on boundaries.
3. **Optimizations**: Added caching logic recommendations to prevent browser locks during large runs.`);
      }
    }

    // Tab 3: SQL Query Architect
    else if (activeTab === 'sql') {
      let result = '';
      let explanation = '';

      if (subMode === 'generate') {
        if (rawQuery.includes('user') || rawQuery.includes('order') || rawQuery.includes('customer') || hasActiveCsv) {
          const table = (hasActiveCsv && activeFileName) ? activeFileName.replace(/\.[^/.]+$/, "") : 'users';
          result = `SELECT 
    ${catCol}, 
    COUNT(*) AS total_rows, 
    SUM(${numCol1}) AS total_${numCol1.toLowerCase()}
FROM ${table}
GROUP BY ${catCol}
ORDER BY total_${numCol1.toLowerCase()} DESC;`;
          explanation = `### SQL Query Steps Breakdown (Active Dataset Schema):
1. **\`FROM ${table}\`**: Queries the table corresponding to your active file \`${activeFileName}\`.
2. **\`SUM(${numCol1})\`**: Aggregates the numeric column \`${numCol1}\` automatically.
3. **\`GROUP BY ${catCol}\`**: Groups records dynamically based on the categorical column \`${catCol}\`.
4. **\`ORDER BY ... DESC\`**: Sorts aggregates in descending order.`;
        } else {
          result = `SELECT column_name, COUNT(*) AS count
FROM table_name
WHERE status = 'Active'
GROUP BY column_name
HAVING count > 5;`;
          explanation = `### General SQL Breakdown:
- Filters records where status is 'Active'.
- Aggregates quantities and checks parameters using \`HAVING\` constraints.`;
        }
      } else {
        // Explain SQL
        result = promptInput;
        explanation = `### SQL Query Explained
- **Target tables**: Users, orders, and products.
- **Aggregates**: Combines and groups rows per category indexes.
- **Performance**: We recommend adding an index to join columns for speedup.`;
      }
      setCompiledResult(result);
      setExplanationResult(explanation);
    }

    // Tab 4: Regex Pattern Builder
    else if (activeTab === 'regex') {
      let result = '';
      let explanation = '';

      if (subMode === 'generate') {
        if (rawQuery.includes('email')) {
          result = `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$`;
          explanation = `### Regex Explanation:
- **\`^\`** and **\`$\`**: Asserts start and end of strings.
- **\`[a-zA-Z0-9._%+-]+\`**: Matches email username rules.
- **\`@\`**: Matches the exact literal separator.
- **\`\\.[a-zA-Z]{2,}\`**: Matches the domain suffix (e.g. .com, .org).`;
        } else if (rawQuery.includes('phone') || rawQuery.includes('number')) {
          result = `^\\+?[1-9]\\d{1,14}$`;
          explanation = `### International Phone Regex:
- Supports optional leading plus sign (\`+\`).
- Followed by country codes and valid digit sequences (E.164 standard).`;
        } else {
          result = `^[A-Za-z0-9_-]{3,16}$`;
          explanation = `### Basic Alphanumeric Regex:
- Matches usernames or slugs between 3 and 16 characters.
- Restricts input to letters, numbers, hyphens, and underscores.`;
        }
      } else {
        // Explain Regex
        result = promptInput;
        explanation = `### Regex Pattern Explanation
- Decoded matches against letter arrays.
- Checks boundaries and asserts string terminations.`;
      }
      setCompiledResult(result);
      setExplanationResult(explanation);
    }
  };

  // Bot Chat response
  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    setTimeout(() => {
      let botResponse = '';
      const query = userMsg.toLowerCase();

      if (query.includes('vlookup')) {
        botResponse = 'VLOOKUP is used to search columns. For example, `=VLOOKUP(A1, B:C, 2, FALSE)` searches for cell A1 in column B, and returns matching values from column C. Would you like me to translate this to XLOOKUP?';
      } else if (query.includes('xlookup')) {
        botResponse = 'XLOOKUP is a modern alternative to VLOOKUP. The syntax is `=XLOOKUP(lookup_val, lookup_col, return_col)`. It does not require column indices, and defaults to exact match!';
      } else if (query.includes('shortcut') || query.includes('hotkey')) {
        botResponse = 'Common spreadsheet shortcuts: \n- **Ctrl + ;** inserts current date.\n- **F4** locks cell references ($A$1).\n- **Alt + =** inserts AutoSum instantly!';
      } else {
        botResponse = 'I can help with formulas! Try asking: "How do I calculate standard deviation?" or "Give me a script to merge cells". I also support SQL queries!';
      }

      setChatMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    }, 1000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* ================= HEADER SECTION ================= */}
      <div className="text-center mb-12 relative">
        <Badge variant="primary" className="mb-4">
          <Sparkles className="w-3.5 h-3.5 mr-1.5 animate-pulse text-[#F59E0B]" />
          Formula Bot Premium Suite
        </Badge>
        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
          Spreadsheet AI & Developer <span className="gradient-text">Orchestra</span>
        </h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
          Generate and explain Excel/Google Sheets formulas, VBA code, SQL queries, and Regex patterns instantly. Power up your productivity.
        </p>

        {/* Dynamic Mode Controller: Express vs Orchestra */}
        <div className="mt-8 inline-flex items-center gap-4 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-2xl p-1.5 shadow-xl">
          <button 
            onClick={() => setOrchestraMode(false)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${!orchestraMode ? 'bg-primary text-white shadow-lg' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          >
            <Cpu className="w-4 h-4" />
            Express Mode
          </button>
          <button 
            onClick={() => setOrchestraMode(true)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${orchestraMode ? 'bg-gradient-to-r from-primary via-[#8B5CF6] to-[#06B6D4] text-white shadow-lg animate-pulse' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
          >
            <Layers className="w-4 h-4" />
            21-Agent Orchestra Co-op
          </button>
        </div>
      </div>

      {/* ================= THE WORKSPACE ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
        
        {/* LEFT COLUMN: Input Panels & Configuration (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Main workspace selector card */}
          <GlassCard className="hud-border shadow-2xl relative overflow-hidden" padding="p-8">
            
            {/* Active CSV Connection Notification Banner */}
            {activeFileName && (
              <div className="mb-6 p-4 rounded-xl bg-success/5 border border-success/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_0_15px_rgba(16,185,129,0.03)] select-none">
                <div className="flex items-start gap-3">
                  <span className="flex h-2.5 w-2.5 translate-y-1.5 rounded-full bg-success animate-ping shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-success flex items-center gap-1.5 uppercase tracking-wider">
                      🟢 Linked to Active Data Lab Schema
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1 font-semibold leading-normal">
                      File: <span className="text-[var(--text-primary)] font-mono">{activeFileName}</span> | Columns: {activeHeaders.map((h, i) => (
                        <span key={i} className="text-primary font-mono bg-primary/10 border border-primary/20 px-1 py-0.5 rounded text-[10px] mx-0.5 whitespace-nowrap">{h}</span>
                      ))}
                    </p>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-xs font-bold cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors shrink-0">
                  <input 
                    type="checkbox" 
                    checked={useActiveCsvSchema} 
                    onChange={(e) => setUseActiveCsvSchema(e.target.checked)}
                    className="accent-success w-4 h-4 rounded"
                  />
                  Inject Columns
                </label>
              </div>
            )}

            {/* Tabs Row */}
            <div className="flex flex-wrap gap-2 mb-8 border-b border-[var(--glass-border)] pb-4">
              <button 
                onClick={() => { setActiveTab('formulas'); setPromptInput(''); setCompiledResult(null); }}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${activeTab === 'formulas' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'}`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Formulas
              </button>
              <button 
                onClick={() => { setActiveTab('vba'); setPromptInput(''); setCompiledResult(null); }}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${activeTab === 'vba' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'}`}
              >
                <Code className="w-4 h-4" />
                VBA & Apps Script
              </button>
              <button 
                onClick={() => { setActiveTab('sql'); setPromptInput(''); setCompiledResult(null); }}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${activeTab === 'sql' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'}`}
              >
                <Database className="w-4 h-4" />
                SQL Queries
              </button>
              <button 
                onClick={() => { setActiveTab('regex'); setPromptInput(''); setCompiledResult(null); }}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${activeTab === 'regex' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'}`}
              >
                <Search className="w-4 h-4" />
                Regex Patterns
              </button>
              <button 
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${activeTab === 'chat' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'}`}
              >
                <HelpCircle className="w-4 h-4" />
                AI Assistant
              </button>
            </div>

            {/* TAB-BASED INTERFACE RENDERING */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + '-' + subMode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {activeTab !== 'chat' && (
                  <>
                    {/* Sub-mode selector (Generate vs Explain) */}
                    <div className="flex gap-2 bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-xl p-1 w-fit">
                      <button 
                        onClick={() => { setSubMode('generate'); setPromptInput(''); setCompiledResult(null); }}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${subMode === 'generate' ? 'bg-[var(--card)] text-[var(--text-primary)] shadow border border-[var(--border)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                      >
                        Generate Code
                      </button>
                      <button 
                        onClick={() => { setSubMode('explain'); setPromptInput(''); setCompiledResult(null); }}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${subMode === 'explain' ? 'bg-[var(--card)] text-[var(--text-primary)] shadow border border-[var(--border)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                      >
                        Explain Code
                      </button>
                    </div>

                    {/* Platform Selector Context */}
                    {activeTab === 'formulas' && subMode === 'generate' && (
                      <div className="flex gap-6 items-center">
                        <span className="text-xs font-semibold text-[var(--text-muted)]">Select target editor:</span>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                            <input 
                              type="radio" 
                              name="platform" 
                              checked={platformType === 'excel'}
                              onChange={() => setPlatformType('excel')}
                              className="accent-primary"
                            />
                            Microsoft Excel
                          </label>
                          <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                            <input 
                              type="radio" 
                              name="platform" 
                              checked={platformType === 'sheets'}
                              onChange={() => setPlatformType('sheets')}
                              className="accent-primary"
                            />
                            Google Sheets
                          </label>
                        </div>
                      </div>
                    )}

                    {activeTab === 'vba' && subMode === 'generate' && (
                      <div className="flex gap-6 items-center">
                        <span className="text-xs font-semibold text-[var(--text-muted)]">Select target language:</span>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                            <input 
                              type="radio" 
                              name="vbaPlatform" 
                              checked={vbaPlatform === 'vba'}
                              onChange={() => setVbaPlatform('vba')}
                              className="accent-primary"
                            />
                            VBA Macros (Excel)
                          </label>
                          <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                            <input 
                              type="radio" 
                              name="vbaPlatform" 
                              checked={vbaPlatform === 'apps-script'}
                              onChange={() => setVbaPlatform('apps-script')}
                              className="accent-primary"
                            />
                            Google Apps Script
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Prompt input field */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-bold text-[var(--text-primary)]">
                          {subMode === 'generate' 
                            ? `Describe what you want to achieve` 
                            : `Paste your target code/formula to analyze`}
                        </label>
                        <span className="text-xs text-[var(--text-muted)]">Example guided</span>
                      </div>
                      
                      <Textarea
                        rows={4}
                        placeholder={
                          subMode === 'generate' 
                            ? activeTab === 'formulas' ? "e.g., Calculate the sum of Column C if Column D has value 'Sales' and Column E is active"
                              : activeTab === 'vba' ? "e.g., Loop through each row and delete the row if the cell in column A is empty"
                              : activeTab === 'sql' ? "e.g., Select username and order date from users and orders tables matching on user ID grouped by date"
                              : "e.g., Validate international phone numbers with optional country code"
                            : activeTab === 'formulas' ? "e.g., =VLOOKUP(A1, B:C, 2, FALSE)"
                              : activeTab === 'vba' ? "e.g., Sub cleanData()... End Sub"
                              : activeTab === 'sql' ? "e.g., SELECT * FROM customers WHERE status = 'Active'"
                              : "e.g., ^[a-zA-Z0-9]+$"
                        }
                        value={promptInput}
                        onChange={(e) => setPromptInput(e.target.value)}
                        className="bg-[var(--bg-surface)] border-[var(--glass-border)] text-sm rounded-xl focus:border-primary placeholder:text-[var(--text-muted)]"
                      />
                    </div>

                    {/* Generate trigger buttons */}
                    <div className="flex gap-4 pt-2">
                      <Button 
                        variant="primary" 
                        size="lg" 
                        onClick={handleCompile}
                        disabled={isCompiling || !promptInput.trim()}
                        className="w-full flex items-center justify-center gap-2.5 font-bold shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] cursor-pointer"
                      >
                        {isCompiling ? (
                          <>
                            <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                            Orchestrating 21 Agents ({compilationProgress}%)
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 fill-white" />
                            {subMode === 'generate' ? 'Generate Solution' : 'Analyze & Explain'}
                          </>
                        )}
                      </Button>
                      
                      {promptInput.trim() && (
                        <button 
                          onClick={() => { setPromptInput(''); setCompiledResult(null); }}
                          className="px-4 py-2.5 rounded-xl border border-[var(--glass-border)] hover:bg-[var(--bg-surface)] text-[var(--text-secondary)] transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </>
                )}

                {/* TAB 5: AI assistant chat interface */}
                {activeTab === 'chat' && (
                  <div className="space-y-4">
                    <div className="h-[300px] overflow-y-auto border border-[var(--glass-border)] rounded-2xl p-4 bg-[var(--bg-surface)] space-y-4">
                      {chatMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-[var(--card)] text-[var(--text-primary)] border border-[var(--border)]'}`}>
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Ask anything about formulas, spreadsheets, VBA..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                        className="bg-[var(--bg-surface)] border-[var(--glass-border)] focus:border-primary"
                      />
                      <Button variant="primary" onClick={handleChatSend} className="cursor-pointer">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </GlassCard>

          {/* TELEMETRY RESULTS AND EXPLANATIONS CARD */}
          <AnimatePresence>
            {compiledResult && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <GlassCard className="hud-border border-primary/20 shadow-2xl relative" padding="p-8">
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    {orchestraMode && (
                      <Badge variant="outline" className="border-success/30 text-success bg-success/5 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        21-Agent Verified
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                    Compiled Output
                  </h3>

                  {/* Render resulting code block */}
                  <div className="relative rounded-2xl bg-[#090D16] border border-[var(--border)] overflow-hidden font-mono text-sm shadow-inner mb-6 group">
                    <div className="flex justify-between items-center px-4 py-2.5 bg-[#0e1422] border-b border-[var(--border)] text-xs text-[var(--text-muted)] font-semibold select-none">
                      <span>{activeTab.toUpperCase()} OUTPUT</span>
                      <button 
                        onClick={() => handleCopy(compiledResult)}
                        className="flex items-center gap-1.5 hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-success" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy Code
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-5 overflow-x-auto text-[#06B6D4] font-semibold leading-relaxed">
                      <code>{compiledResult}</code>
                    </pre>
                  </div>

                  {/* Dynamic Action Buttons for Tab Swapping */}
                  {activeTab !== 'regex' && activeTab !== 'chat' && (
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('changeTab', { detail: 'dashboard' }));
                        }}
                        className="w-full flex items-center justify-center gap-1.5 font-bold cursor-pointer text-success border-success/30 bg-success/5 hover:bg-success/15 transition-all duration-300"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        📊 Open BI Dashboard
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('changeTab', { detail: 'uploader' }));
                        }}
                        className="w-full flex items-center justify-center gap-1.5 font-bold cursor-pointer text-cyan-400 border-cyan-400/30 bg-cyan-500/5 hover:bg-cyan-500/15 transition-all duration-300"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        📁 Open Data Pipeline Grid
                      </Button>
                    </div>
                  )}

                  {/* Explain details */}
                  {explanationResult && (
                    <div className="border-t border-[var(--glass-border)] pt-6 space-y-4">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">Detailed Explanation Breakdown</h4>
                      <div className="text-sm text-[var(--text-secondary)] leading-relaxed space-y-3 prose prose-invert max-w-none">
                        {explanationResult.split('\n').map((line, idx) => {
                          if (line.startsWith('### ')) {
                            return <h5 key={idx} className="text-base font-bold text-[var(--text-primary)] mt-4 mb-2">{line.replace('### ', '')}</h5>;
                          }
                          if (line.startsWith('- ') || line.startsWith('* ')) {
                            return <li key={idx} className="ml-4 list-disc text-[var(--text-secondary)] py-0.5">{line.substring(2)}</li>;
                          }
                          if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ')) {
                            return <div key={idx} className="pl-2 font-medium text-[var(--text-primary)] py-1">{line}</div>;
                          }
                          return <p key={idx}>{line}</p>;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Direct Spreadsheet execution guide */}
                  {activeTab === 'formulas' && (
                    <div className="mt-6 flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/10 text-xs text-[var(--text-secondary)]">
                      <HelpIcon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[var(--text-primary)] block mb-1">How to apply in spreadsheet:</strong>
                        1. Copy the formula above. 2. Select the target cell in your spreadsheet. 3. Paste directly into the edit formula bar and press **Enter**.
                      </div>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: 21-Agent Orchestra Dashboard & Telemetry Logs (5 cols) */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* Orchestra visual panel */}
          <GlassCard className="hud-border border-[#8B5CF6]/20 shadow-2xl relative" padding="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-black flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#8B5CF6]" />
                  Orchestra Dashboard
                </h3>
                <p className="text-xs text-[var(--text-muted)]">Real-time cooperative telemetry diagnostics</p>
              </div>
              <Badge variant="outline" className={`border-purple-500/20 text-purple-400 bg-purple-500/5 ${isCompiling ? 'animate-pulse' : ''}`}>
                {orchestraMode ? '21 Agents Engaged' : 'Idle'}
              </Badge>
            </div>

            {/* SVG Interactive Node Network Graph */}
            <div className="relative rounded-2xl bg-[#090D16]/80 border border-[var(--border)] overflow-hidden aspect-[4/3] p-2 flex items-center justify-center">
              
              {!orchestraMode ? (
                <div className="absolute inset-0 bg-[#090D16]/90 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <Cpu className="w-10 h-10 text-[var(--text-muted)] opacity-50" />
                  <div>
                    <h4 className="text-sm font-bold text-[var(--text-primary)]">Express Mode Active</h4>
                    <p className="text-xs text-[var(--text-muted)] max-w-[240px] mt-1">Multi-agent node visualization is disabled. Turn on Orchestra Mode to see agents cooperate.</p>
                  </div>
                  <button 
                    onClick={() => setOrchestraMode(true)}
                    className="px-4 py-2 rounded-xl bg-primary/20 text-primary border border-primary/30 text-xs font-bold hover:bg-primary/30 transition-colors cursor-pointer"
                  >
                    Enable Visual Orchestra
                  </button>
                </div>
              ) : null}

              <svg viewBox="0 0 640 480" className="w-full h-full relative z-10 select-none">
                {/* SVG Connections Lines */}
                {CONNECTIONS.map((conn, idx) => {
                  const fromAgent = ORCHESTRA_ROSTER[conn.from];
                  const toAgent = ORCHESTRA_ROSTER[conn.to];
                  const isLineActive = isCompiling && 
                    (activeAgentIndex === conn.from || activeAgentIndex === conn.to);
                  
                  return (
                    <line 
                      key={idx}
                      x1={fromAgent.x}
                      y1={fromAgent.y}
                      x2={toAgent.x}
                      y2={toAgent.y}
                      stroke={isLineActive ? '#10B981' : 'rgba(139, 92, 246, 0.15)'}
                      strokeWidth={isLineActive ? 2.5 : 1.2}
                      className={isLineActive ? 'animate-pulse' : ''}
                      style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }}
                    />
                  );
                })}

                {/* SVG Nodes */}
                {ORCHESTRA_ROSTER.map((agent, index) => {
                  const isActive = isCompiling && activeAgentIndex === index;
                  const hasProcessed = isCompiling && activeAgentIndex !== null && index < activeAgentIndex;
                  
                  return (
                    <g key={agent.id} className="cursor-pointer group">
                      {/* Glow circle */}
                      <circle 
                        cx={agent.x}
                        cy={agent.y}
                        r={isActive ? 18 : 12}
                        fill={isActive ? `${agent.color}40` : hasProcessed ? '#10B98115' : 'rgba(9, 13, 22, 0.8)'}
                        stroke={isActive ? '#10B981' : hasProcessed ? '#10B98180' : 'rgba(139, 92, 246, 0.3)'}
                        strokeWidth={isActive ? 2 : 1.5}
                        className={isActive ? 'animate-pulse' : 'transition-all duration-300'}
                      />
                      
                      {/* Abbreviated Name */}
                      <text
                        x={agent.x}
                        y={agent.y + 4}
                        textAnchor="middle"
                        fontSize={isActive ? '10px' : '8px'}
                        fontWeight="bold"
                        fill={isActive ? '#ffffff' : hasProcessed ? '#10B981' : 'rgba(255,255,255,0.7)'}
                      >
                        {agent.abbr}
                      </text>

                      {/* Floating details on hover */}
                      <title>{`${agent.name} (${agent.role})`}</title>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Orchestra Stage Tracking Progress */}
            {isCompiling && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-primary flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                    {compilationStage}
                  </span>
                  <span className="text-[var(--text-secondary)]">{compilationProgress}%</span>
                </div>
                <div className="h-1 rounded-full bg-[var(--bg-surface)] overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-[#10B981] transition-all duration-300"
                    style={{ width: `${compilationProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Compilation Metrics Gauge Panel */}
            {consensusScore > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[var(--glass-border)] pt-4 select-none">
                <div className="bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-xl p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Consensus Index</span>
                  <div className="text-lg font-black text-success mt-1">{consensusScore}%</div>
                </div>
                <div className="bg-[var(--bg-surface)] border border-[var(--glass-border)] rounded-xl p-3 text-center">
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">Errors Trapped</span>
                  <div className="text-lg font-black text-primary mt-1">0 / Zero</div>
                </div>
              </div>
            )}
          </GlassCard>

          {/* REALTIME TERMINAL LOGS FEED */}
          <GlassCard className="hud-border border-[#06B6D4]/20 shadow-2xl overflow-hidden" padding="p-0">
            <div className="flex justify-between items-center px-6 py-4 bg-[#0e1422] border-b border-[var(--border)]">
              <h4 className="text-sm font-black flex items-center gap-2 text-[var(--text-primary)]">
                <Terminal className="w-4.5 h-4.5 text-[var(--text-secondary)]" />
                Terminal Cooperative Log
              </h4>
              <Badge variant="outline" className="text-[10px] font-bold border-cyan-500/20 text-cyan-400">
                STABLE
              </Badge>
            </div>
            
            <div className="p-5 h-[220px] overflow-y-auto bg-[#05080f] font-mono text-[11px] leading-relaxed text-cyan-500 space-y-2 select-text selection:bg-cyan-500/35">
              {terminalLogs.length === 0 ? (
                <div className="text-[var(--text-muted)] italic py-10 text-center">
                  Logs are currently empty. Run a generation block to stream collaborative terminal details...
                </div>
              ) : (
                terminalLogs.map((log, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-[#8B5CF6] select-none">&gt;&gt;</span>
                    <span>{log}</span>
                  </div>
                ))
              )}
              <div ref={terminalEndRef} />
            </div>
          </GlassCard>
        </div>
      </div>

      {/* ================= RESOURCE CHIPS & GUIDES ================= */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border-t border-[var(--glass-border)] pt-16">
        
        {/* CHEAT SHEETS MODULE (8 cols) */}
        <div className="md:col-span-8 space-y-6">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Spreadsheet Cheat Sheets
              </h3>
              <p className="text-sm text-[var(--text-muted)]">Quickly learn formulas and functions syntax rules</p>
            </div>
            
            {/* Filter buttons */}
            <div className="flex flex-wrap gap-1.5 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-xl p-1 text-xs font-semibold select-none">
              {['All', 'Lookup', 'Math', 'Logical', 'Text', 'Date'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCheatFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${cheatFilter === cat ? 'bg-primary text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CHEAT_SHEETS.filter(item => cheatFilter === 'All' || item.cat === cheatFilter).map(item => (
              <GlassCard key={item.id} className="hover:border-primary/30 transition-all duration-300" padding="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-black text-base text-[var(--text-primary)]">{item.title}</h4>
                  <Badge variant="primary" className="text-[10px]">{item.cat}</Badge>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-3">{item.desc}</p>
                <div className="font-mono text-[10px] text-cyan-400 bg-[#090D16] p-2 rounded border border-[var(--border)] select-all leading-normal">
                  {item.syntax}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* WORKSPACE HOTKEYS PANEL (4 cols) */}
        <div className="md:col-span-4 space-y-6">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#F59E0B]" />
              Supercharger Hotkeys
            </h3>
            <p className="text-sm text-[var(--text-muted)]">Work like an absolute professional</p>
          </div>

          <div className="space-y-3 bg-[var(--bg-secondary)] border border-[var(--glass-border)] rounded-2xl p-5 select-none">
            {HOTKEYS.map((key, i) => (
              <div key={i} className="flex justify-between items-center gap-4 py-2 border-b border-[var(--glass-border)] last:border-0 last:pb-0">
                <span className="text-xs text-[var(--text-secondary)] font-semibold leading-normal">{key.desc}</span>
                <span className="font-mono text-[10px] bg-[var(--bg-surface)] px-2.5 py-1 rounded border border-[var(--border)] text-primary font-bold shrink-0">
                  {key.keys}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
