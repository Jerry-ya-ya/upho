import numpy as np
from phonopy.structure.atoms import PhonopyAtoms

from upho.phonon.star_creator import StarCreator


def test_create_star_accepts_integer_kpoint():
    atoms = PhonopyAtoms(
        symbols=["Si"],
        cell=np.eye(3),
        scaled_positions=[[0, 0, 0]],
    )

    star, _ = StarCreator(atoms=atoms).create_star([0, 0, 0])

    np.testing.assert_array_equal(star, [[0, 0, 0]])
