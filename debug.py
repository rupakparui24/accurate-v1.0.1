from pathlib import Path
import re
text = Path("components/Dashboard.tsx").read_text().replace("\r\n", "\n")
if "ChatSession" not in text:
    text = text.replace("  ChatTurn,\n  DashboardData,", "  ChatTurn,\n  ChatSession,\n  DashboardData,", 1)
match = re.search(r'(function pickChartSource[\s\S]+?return "verifications";\n\n}\n)', text)
text = text[:match.end()] + "\n\nHELPERS\n" + text[match.end():]
marker = "  const [delayInsights] = useState(initialData.delayInsights);\n\n  const [isNavOpen, setIsNavOpen] = useState(true);"
replacement = "  const [delayInsights] = useState(initialData.delayInsights);\n\nADDED\n  const [isNavOpen, setIsNavOpen] = useState(true);"
text = text.replace(marker, replacement, 1)
console_pattern = re.compile(r"  const handleConsoleSubmit = useCallback\([\s\S]+?\n  \);\n")
text, _ = console_pattern.subn('CONSOLE_BLOCK\n', text, count=1)
insert_marker = '  const handleAddApplicant = useCallback('
text = text.replace(insert_marker, 'SESSION_BLOCK\n' + insert_marker, 1)
history_pattern = re.compile(r"  const handleSelectHistoryTurn = useCallback\([\s\S]+?\n  \);\n")
text = history_pattern.sub('', text, count=1)
print('<PromptSidebar' in text)
if '<PromptSidebar' in text:
    idx = text.index('<PromptSidebar')
    print(repr(text[idx:idx+30]))
