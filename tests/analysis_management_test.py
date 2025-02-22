import unittest
import pytest

from buckaroo.pluggable_analysis_framework import (
    ColAnalysis)

from buckaroo.analysis_management import (
    AnalsysisPipeline, produce_summary_df, NonExistentSummaryRowException)

from buckaroo.analysis import (TypingStats, DefaultSummaryStats)
from .fixtures import (test_df, df, DistinctCount, Len, DistinctPer, DCLen)

class TestAnalysisPipeline(unittest.TestCase):
    def test_produce_summary_df(self):
        produce_summary_df(test_df, [DistinctCount, Len, DistinctPer], 'test_df')


    def test_pipeline_base(self):
        ap = AnalsysisPipeline([TypingStats, DefaultSummaryStats])
        #just verify that there are no errors
        ap.process_df(df)

    def test_add_aobj(self):
        ap = AnalsysisPipeline([TypingStats, DefaultSummaryStats])
        class Foo(ColAnalysis):
            provided_summary = [
                'foo',]
            requires_summary = ['length']

            @staticmethod
            def summary(sampled_ser, summary_ser, ser):
                return dict(foo=8)
        assert ap.add_analysis(Foo) == True #verify no errors thrown
        sdf, _unused = ap.process_df(df)
        self.assertEqual(sdf.loc['foo']['tripduration'], 8)

    def test_add_buggy_aobj(self):
        ap = AnalsysisPipeline([TypingStats, DefaultSummaryStats])
        class Foo(ColAnalysis):
            provided_summary = [
                'foo',]
            requires_summary = ['length']

            @staticmethod
            def summary(sampled_ser, summary_ser, ser):
                1/0 #throw an error
                return dict(foo=8)
        assert ap.add_analysis(Foo) == False

    def test_replace_aobj(self):
        ap = AnalsysisPipeline([TypingStats, DefaultSummaryStats])
        class Foo(ColAnalysis):
            provided_summary = [
                'foo',]
            requires_summary = ['length']

            @staticmethod
            def summary(sampled_ser, summary_ser, ser):
                return dict(foo=8)
        ap.add_analysis(Foo)
        sdf, _unused = ap.process_df(df)
        self.assertEqual(sdf.loc['foo']['tripduration'], 8)
        #18 facts returned about tripduration
        self.assertEqual(len(sdf['tripduration']), 18)
        #Create an updated Foo that returns 9
        class Foo(ColAnalysis):
            provided_summary = [
                'foo',]
            requires_summary = ['length']

            @staticmethod
            def summary(sampled_ser, summary_ser, ser):
                return dict(foo=9)
        ap.add_analysis(Foo)
        sdf2, _unused = ap.process_df(df)
        self.assertEqual(sdf2.loc['foo']['tripduration'], 9)
        #still 18 facts returned about tripduration
        self.assertEqual(len(sdf2['tripduration']), 18)
        #Create an updated Foo that returns 9

    def test_summary_stats_display(self):
        ap = AnalsysisPipeline([TypingStats])
        self.assertEqual(ap.summary_stats_display, "all")
        ap = AnalsysisPipeline([TypingStats, DefaultSummaryStats])
        print(ap.summary_stats_display)
        self.assertTrue("dtype" in ap.summary_stats_display)

    def test_add_summary_stats_display(self):
        ap = AnalsysisPipeline([TypingStats, DefaultSummaryStats])
        class Foo(ColAnalysis):
            provided_summary = ['foo']
            requires_summary = ['length']
            summary_stats_display = ['foo']

        ap.add_analysis(Foo)
        self.assertEquals(ap.summary_stats_display, ['foo'])

    def test_invalid_summary_stats_display_throws(self):
        ap = AnalsysisPipeline([TypingStats, DefaultSummaryStats])
        class Foo(ColAnalysis):
            provided_summary = ['foo']
            requires_summary = ['length']
            summary_stats_display = ['not_provided']

        def bad_add():
            ap.add_analysis(Foo)            

        self.assertRaises(NonExistentSummaryRowException, bad_add)

