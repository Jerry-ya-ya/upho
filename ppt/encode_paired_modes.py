from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parent
for mode in ('acoustic','optical'):
    for kind in ('combined','curve','chain'):
        frames=[Image.open(p).convert('RGB') for p in sorted((root/'.build/paired-frames').glob(f'{mode}-{kind}-*.png'))]
        assert len(frames)==120
        out=root/'assets'/f'{mode}-{kind}-v007.gif'
        frames[0].save(out,save_all=True,append_images=frames[1:],duration=80,loop=0,disposal=2,optimize=False)
        with Image.open(out) as image: assert image.n_frames==120
print('Encoded six synchronized 9.6-second clips; common model time 0..23.8, resetting on loop.')
