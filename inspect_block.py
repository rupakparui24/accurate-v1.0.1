from pathlib import Path
text = Path("components/Dashboard.tsx").read_text().replace("\r\n", "\n")
start = text.index("<PromptSidebar")
for offset in range(start, len(text)):
    if text[offset] == '/' and text[offset + 1] == '>':
        print(offset - start)
        break
