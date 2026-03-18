import pdfplumber
import sys

def extract_pdf_text(file_path):
    try:
        with pdfplumber.open(file_path) as pdf:
            text = ""
            for page in pdf.pages:
                text += page.extract_text() + "\n"
            return text
    except Exception as e:
        return str(e)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python extract_pdf.py <file_path>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    print(f"--- CONTENT OF {file_path} ---")
    print(extract_pdf_text(file_path))
