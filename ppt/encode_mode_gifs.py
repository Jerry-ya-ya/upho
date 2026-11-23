"""Encode frames captured from the reference diatomic-chain renderer."""
from pathlib import Path
from PIL import Image
root = Path(__file__).resolve().parent
for mode in ('acoustic', 'optical'):
    frames = [Image.open(f).convert('RGB') for f in sorted((root / '.build/mode-frames').glob(mode + '-*.png'))]
    if len(frames) != 60:
        raise ValueError('Expected exactly 60 frames per mode')
    output = root / 'assets' / (mode + '-chain.gif')
    frames[0].save(output, save_all=True, append_images=frames[1:], duration=50, loop=0, optimize=False, disposal=2)
    with Image.open(output) as result:
        assert result.n_frames == 60 and result.info['loop'] == 0
print('Encoded two GIFs with independently normalized 3-second cycles.')
