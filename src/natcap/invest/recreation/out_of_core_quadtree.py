# -*- coding: utf-8 -*-
"""Pure-Python fallback for the compiled Cython module ``out_of_core_quadtree``.

Real module: ``natcap/invest/src/natcap/invest/recreation/out_of_core_quadtree.pyx``.
Provides an out-of-core quadtree spatial index used by the Recreation model.
"""
from natcap.invest.cython_compat import _not_available


class OutOfCoreQuadTree(object):
    """Stub — see module docstring."""

    def __init__(self, *args, **kwargs):
        _not_available('out_of_core_quadtree.OutOfCoreQuadTree')(*args, **kwargs)

    def flush(self):
        _not_available('out_of_core_quadtree.OutOfCoreQuadTree.flush')()

    def add_points(self, *args, **kwargs):
        _not_available('out_of_core_quadtree.OutOfCoreQuadTree.add_points')(
            *args, **kwargs)

    def get_intersecting_points_in_polygon(self, *args, **kwargs):
        _not_available(
            'out_of_core_quadtree.OutOfCoreQuadTree.get_intersecting_points_in_polygon')(
            *args, **kwargs)

    def get_intersecting_points_in_bounding_box(self, *args, **kwargs):
        _not_available(
            'out_of_core_quadtree.OutOfCoreQuadTree.get_intersecting_points_in_bounding_box')(
            *args, **kwargs)
