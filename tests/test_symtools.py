import numpy as np
from phonopy.structure.atoms import PhonopyAtoms

from upho.structure.symtools import get_rotations_cart


def test_get_rotations_cart_accepts_phonopy_atoms():
    atoms = PhonopyAtoms(
        symbols=["Si"],
        cell=np.eye(3),
        scaled_positions=[[0, 0, 0]],
    )

    rotations = get_rotations_cart(atoms)

    assert rotations.shape == (48, 3, 3)
    assert any(np.array_equal(rotation, np.eye(3)) for rotation in rotations)
