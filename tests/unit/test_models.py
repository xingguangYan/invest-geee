"""Smoke tests for invest-geee model discovery."""
import os
import subprocess
import sys

sys.path.insert(0, "src")
import natcap.invest.models as m


def test_models_discovered():
    assert len(m.pyname_to_module) >= 25


def test_cli_list():
    r = subprocess.run(
        [sys.executable, "-m", "natcap.invest.cli", "list"],
        capture_output=True, text=True,
        cwd=r"D:\软件\INVEST",
        env={**os.environ, "PYTHONPATH": "src"},
    )
    assert r.returncode == 0, f"cli failed:\n{r.stderr}"
    assert "carbon" in r.stdout
    assert "annual_water_yield" in r.stdout


def test_geee_list():
    from natcap.invest.geee import list_gee_models
    models = list_gee_models()
    assert "carbon" in models
    assert "sdr" in models
