# -*- coding: utf-8 -*-
"""Pure-Python fallback for the compiled Cython module ``sdr_core``.

The real module is a Cython extension compiled against pygeoprocessing
(``natcap/invest/src/natcap/invest/sdr/sdr_core.pyx``).  It implements the
recursive sediment deposition / flux routing described in the SDR model
documentation.

This stub keeps the same public surface so that ``import natcap.invest.sdr``
and ``invest list`` / ``invest validate`` work in a pure-Python environment.
Calling the algorithm raises a clear ``RuntimeError``.
"""
from natcap.invest.cython_compat import _not_available


def calculate_sediment_deposition(
        flow_direction_path, e_prime_path, f_path, sdr_path,
        target_sediment_deposition_path, algorithm):
    """Calculate sediment deposition layer (stub — see module docstring)."""
    _not_available('sdr_core.calculate_sediment_deposition')(
        flow_direction_path, e_prime_path, f_path, sdr_path,
        target_sediment_deposition_path, algorithm)
