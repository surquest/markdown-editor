export interface MinimalEditorProps {
  content: string;
  onSave?: (markdown: string) => void;
}
