import io
import numpy as np
import pytest
from upho.cui.settings import _parse_phonopy_conf_strings, _parse_primitive_axes


class TestSettings:
    def test_fractional_axes_without_expression_evaluation(self):
        axes = _parse_primitive_axes("1/2 0 0 0 1 0 0 0 1")
        np.testing.assert_array_equal(axes, np.diag([0.5, 1.0, 1.0]))
        with pytest.raises(ValueError):
            _parse_primitive_axes("1+1 0 0 0 1 0 0 0 1")

    def test_comments(self):
        s0 = ''.join([
            'DIM = 2 2 2\n',
            'PRIMITIVE_AXES =  0 1 1  1 0 1  1 1 0\n',
        ])
        s1 = ''.join([
            'DIM = 2 2 2  # supercell\n',
            'PRIMITIVE_AXES =  0 1 1  1 0 1  1 1 0\n',
        ])
        with io.StringIO(s0) as f0:
            d0 = _parse_phonopy_conf_strings(f0.readlines())
        with io.StringIO(s1) as f1:
            d1 = _parse_phonopy_conf_strings(f1.readlines())
        for k0 in d0.keys():
            assert np.all(d0[k0] == d1[k0])

    def test_continuous_lines(self):
        s0 = ''.join([
            'DIM = 2 2 2\n',
            'PRIMITIVE_AXES =  0 1 1  1 0 1  1 1 0\n',
        ])
        s1 = ''.join([
            'DIM = +++\n',
            '2 2 2\n',
            'PRIMITIVE_AXES =  0 1 1  1 0 1  1 1 0\n',
        ])
        with io.StringIO(s0) as f0:
            d0 = _parse_phonopy_conf_strings(f0.readlines())
        with io.StringIO(s1) as f1:
            d1 = _parse_phonopy_conf_strings(f1.readlines())
        for k0 in d0.keys():
            assert np.all(d0[k0] == d1[k0])
