"""Package rendered slides as a PDF; requires ReportLab and pypdf."""
import sys
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from pypdf import PdfReader
images = sorted(Path(sys.argv[1]).glob('slide-*.png'))
if not images:
    raise SystemExit('No rendered slides')
output = Path(sys.argv[2])
if output.exists():
    raise SystemExit('Refusing to overwrite PDF')
c = canvas.Canvas(str(output), pagesize=(960, 540))
c.setTitle(output.stem)
for image in images:
    reader = ImageReader(str(image))
    w, h = reader.getSize()
    c.setPageSize((w * .75, h * .75))
    c.drawImage(reader, 0, 0, width=w * .75, height=h * .75)
    c.showPage()
c.save()
assert len(PdfReader(output).pages) == len(images)
print(f'Validated {len(images)} PDF pages')
