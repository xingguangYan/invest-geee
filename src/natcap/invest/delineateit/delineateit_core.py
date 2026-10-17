# -*- coding: utf-8 -*-
"""Pure-Python fallback for the compiled Cython module ``delineateit_core``.

Real module: ``natcap/invest/src/natcap/invest/delineateit/delineateit_core.pyx``.
Implements per-block pour-point detection used by DelineateIt.
"""
from natcap.invest.cython_compat import _not_available


def calculate_pour_point_array(
        flow_dir_array, edges, nodata, offset, origin, pixel_size):
    """Return a set of (x, y) pour-point coordinates (stub)."""
    _not_available('delineateit_core.calculate_pour_point_array')(
        flow_dir_array, edges, nodata, offset, origin, pixel_size)
