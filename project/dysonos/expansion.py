# dysonos/expansion.py
class ExpansionEngine:
    @staticmethod
    def should_expand(utilization, threshold=80):
        return utilization >= threshold
