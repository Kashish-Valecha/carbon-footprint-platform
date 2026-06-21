import unittest

def get_equivalents(co2_kg):
    return {
        "cooking_days": round(co2_kg / 0.5, 1),
        "phone_charges": round(co2_kg / 0.008),
        "trees_absorbed": round(co2_kg / 21, 2)
    }

class TestCalculator(unittest.TestCase):
    def test_get_equivalents(self):
        result = get_equivalents(10)
        self.assertEqual(result["cooking_days"], 20.0)
        self.assertEqual(result["phone_charges"], 1250)
        self.assertEqual(result["trees_absorbed"], 0.48)

if __name__ == '__main__':
    unittest.main()

