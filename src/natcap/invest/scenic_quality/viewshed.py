# -*- coding: utf-8 -*-
"""Pure-Python fallback for the compiled Cython module ``viewshed``.

Real module: ``natcap/invest/src/natcap/invest/scenic_quality/viewshed.pyx``.
Implements the Wang et al. (2000) reference-plane viewshed algorithm.
"""
from natcap.invest.cython_compat import _not_available


def viewshed(
        dem_raster_path_band,
        viewpoint,
        visibility_filepath,
        viewpoint_height=0.0,
        curved_earth=True,
        refraction_coeff=0.13,
        max_distance=None,
        aux_filepath=None):
    """Compute the Wang et al. reference-plane based viewshed (stub)."""
    _not_available('viewshed.viewshed')(
        dem_raster_path_band, viewpoint, visibility_filepath,
        viewpoint_height=viewpoint_height, curved_earth=curved_earth,
        refraction_coeff=refraction_coeff, max_distance=max_distance,
        aux_filepath=aux_filepath)
