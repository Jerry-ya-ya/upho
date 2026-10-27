import pytest
import yaml

from upho.file_io import read_input


def test_read_input_accepts_plain_yaml(tmp_path):
    config = tmp_path / "input.yaml"
    config.write_text("run_mode: single_point\nqpoint: [0, 0, 0]\n")

    assert read_input(config) == {
        "run_mode": "single_point",
        "qpoint": [0, 0, 0],
    }


def test_read_input_rejects_python_object_tags(tmp_path):
    config = tmp_path / "input.yaml"
    config.write_text("value: !!python/object/apply:builtins.list []\n")

    with pytest.raises(yaml.constructor.ConstructorError):
        read_input(config)
