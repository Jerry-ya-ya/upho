import numpy as np
from phonopy.structure.atoms import PhonopyAtoms

from upho.structure.structure_analyzer import StructureAnalyzer


def test_remove_and_expand_atoms_with_modern_phonopy():
    atoms = PhonopyAtoms(
        symbols=["Si", "Ge"],
        masses=[28.1, 72.6],
        cell=np.eye(3),
        scaled_positions=[[0, 0, 0], [0.5, 0.5, 0.5]],
    )
    analyzer = StructureAnalyzer(atoms)

    analyzer.remove_atoms_indices(0)
    analyzer.generate_supercell([2, 1, 1])

    result = analyzer.get_atoms()
    assert result.symbols == ["Ge", "Ge"]
    np.testing.assert_array_equal(result.masses, [72.6, 72.6])
    assert len(result) == 2
