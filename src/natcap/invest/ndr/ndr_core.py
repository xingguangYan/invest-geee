# -*- coding: utf-8 -*-
"""Pure-Python fallback for the compiled Cython module ``ndr_core``.

Real module: ``natcap/invest/src/natcap/invest/ndr/ndr_core.pyx``.
Implements the recursive effective-retention routing for nutrients.
"""
from natcap.invest.cython_compat import _not_available


def ndr_eff_calculation(
        flow_direction_path, stream_path, retention_eff_lulc_path,
        crit_len_path, effective_retention_path, algorithm):
    """Calculate flow-downhill effective retention (stub)."""
    _not_available('ndr_core.ndr_eff_calculation')(
        flow_direction_path, stream_path, retention_eff_lulc_path,
        crit_len_path, effective_retention_path, algorithm)
