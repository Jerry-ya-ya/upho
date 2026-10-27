# UPHO

[![GitHubActions](https://github.com/yuzie007/upho/actions/workflows/tests.yml/badge.svg)](https://github.com/yuzie007/upho/actions?query=workflow%3ATests)

Band unfolding for phonons (http://yuzie007.github.io/upho/)

## Requirements

- setuptools (installation)
- numpy
- h5py
- scipy
- spglib
- matplotlib
- phonopy==2.14.0
- seekpath==2.1.0

## Install

To install the v0.6.6 release directly:

```bash
pip install git+https://github.com/yuzie007/upho.git@v0.6.6
```

To work from this checkout, create a virtual environment in the repository root.
On Windows PowerShell:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -e .
```

On macOS or Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -e .
```

The editable install reads the dependencies from `setup.py` and installs this project into the active virtual environment.

It also exposes the `upho_weights`, `upho_sf`, `upho_qpoints`, `upho_fit`, and
`upho_plot` commands.

Run `deactivate` when you are done.

The project's CI tests Python 3.7 with Phonopy 2.7.0 and 2.14.0;
other combinations have not been verified here.

Once you have installed the tools that we require, you can test by using these commands if those tools we have successfully installed.

```bash
python -m pip show upho
python -m pip show phonopy
python -c "import upho; print(upho.__file__)"
```

## Usage and Tutorial

See the `examples` directory.

## Options (`upho_weights`)

### `--average_masses`

Atomic masses whose sites are equivalent in the underlying structure
are averaged.

### `--average_force_constants`

FC elements which are equivalent under the symmetry operations
for the underlying structure are averaged.

## Options (`upho_sf`)

### `-f FILENAME`, `--filename FILENAME`

Filename for the data of weights.

### `--format {hdf5,text}`

Output file format.

### `--function {gaussian,lorentzian}`

Function used for the smearing.

### `-s SIGMA`, `--sigma SIGMA`

Parameter for the smearing function (THz).
For Gaussian, this is the standard deviation.
For Lorentzian, this is the HWHM (gamma).

### `--fmax FMAX`

Maximum frequency (THz).

### `--fmin FMIN`

Minimum frequency (THz).

### `--fpitch FPITCH`

Frequency pitch (THz).

### `--squared`

Use squared frequencies instead of raw frequencies.

## Not yet (possible bugs)

(Projective) representations of little cogroup may be treated in a wrong way
when we consider wave vectors on the BZ boundary and translational parts of
symmetry operations are not equal to zero.

## Author(s)

Yuji Ikeda (yuji.ikeda.ac.jp@gmail.com, Universität Stuttgart, Germany)

## How to cite

When using this code, please cite the following article.

    *Mode decomposition based on crystallographic symmetry in the band-unfolding method*,
    Yuji Ikeda, Abel Carreras, Atsuto Seko, Atsushi Togo, and Isao Tanaka,
    Phys. Rev. B **95**, 024305 (2017).
    http://journals.aps.org/prb/abstract/10.1103/PhysRevB.95.024305

For high entropy alloy works, you can also consider

    *Phonon Broadening in High Entropy Alloys*,
    Fritz Körmann, Yuji Ikeda, Blazej Grabowski, and Marcel H. F. Sluiter,
    Npj Comput. Mater. **3**, 1 (2017).
    https://www.nature.com/articles/s41524-017-0037-8
