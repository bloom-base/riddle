"""
Tests for the Sudoku game logic
"""

import pytest
from sudoku import Sudoku


class TestSudokuValidation:
    """Test sudoku validation logic"""

    def test_valid_move_empty_cell(self):
        """Test that a valid number can be placed in an empty cell"""
        sudoku = Sudoku()
        # Initialize a simple board
        sudoku.board = [[0] * 9 for _ in range(9)]
        
        # Should be valid to place 1 at (0, 0)
        assert sudoku.is_valid(0, 0, 1) is True

    def test_invalid_move_duplicate_in_row(self):
        """Test that duplicate numbers in row are invalid"""
        sudoku = Sudoku()
        sudoku.board = [[0] * 9 for _ in range(9)]
        sudoku.board[0][0] = 1
        
        # Should be invalid to place 1 at (0, 1) - same row
        assert sudoku.is_valid(0, 1, 1) is False

    def test_invalid_move_duplicate_in_column(self):
        """Test that duplicate numbers in column are invalid"""
        sudoku = Sudoku()
        sudoku.board = [[0] * 9 for _ in range(9)]
        sudoku.board[0][0] = 1
        
        # Should be invalid to place 1 at (1, 0) - same column
        assert sudoku.is_valid(1, 0, 1) is False

    def test_invalid_move_duplicate_in_box(self):
        """Test that duplicate numbers in 3x3 box are invalid"""
        sudoku = Sudoku()
        sudoku.board = [[0] * 9 for _ in range(9)]
        sudoku.board[0][0] = 1
        
        # Should be invalid to place 1 at (1, 1) - same 3x3 box
        assert sudoku.is_valid(1, 1, 1) is False
        
        # But should be valid at (3, 3) - different box
        assert sudoku.is_valid(3, 3, 1) is True

    def test_valid_move_different_boxes(self):
        """Test that same number can be in different boxes"""
        sudoku = Sudoku()
        sudoku.board = [[0] * 9 for _ in range(9)]
        sudoku.board[0][0] = 1
        
        # Should be valid to place 1 at (3, 3) - different box
        assert sudoku.is_valid(3, 3, 1) is True
        
        # Should be valid to place 1 at (0, 3) - different box, same row needs different col in different box
        assert sudoku.is_valid(0, 3, 1) is False  # Same row


class TestSudokuCompletion:
    """Test sudoku completion detection"""

    def test_incomplete_board(self):
        """Test that board with empty cells is marked incomplete"""
        sudoku = Sudoku()
        sudoku.board = [[0] * 9 for _ in range(9)]
        assert sudoku.is_complete() is False

    def test_complete_board(self):
        """Test that completely filled board is marked complete"""
        sudoku = Sudoku()
        # Create a valid solved sudoku
        solution = [
            [5, 3, 4, 6, 7, 8, 9, 1, 2],
            [6, 7, 2, 1, 9, 5, 3, 4, 8],
            [1, 9, 8, 3, 4, 2, 5, 6, 7],
            [8, 5, 9, 7, 6, 1, 4, 2, 3],
            [4, 2, 6, 8, 5, 3, 7, 9, 1],
            [7, 1, 3, 9, 2, 4, 8, 5, 6],
            [9, 6, 1, 5, 3, 7, 2, 8, 4],
            [2, 8, 7, 4, 1, 9, 6, 3, 5],
            [3, 4, 5, 2, 8, 6, 1, 7, 9]
        ]
        sudoku.board = solution
        assert sudoku.is_complete() is True

    def test_valid_solution(self):
        """Test that a valid complete solution is recognized"""
        sudoku = Sudoku()
        solution = [
            [5, 3, 4, 6, 7, 8, 9, 1, 2],
            [6, 7, 2, 1, 9, 5, 3, 4, 8],
            [1, 9, 8, 3, 4, 2, 5, 6, 7],
            [8, 5, 9, 7, 6, 1, 4, 2, 3],
            [4, 2, 6, 8, 5, 3, 7, 9, 1],
            [7, 1, 3, 9, 2, 4, 8, 5, 6],
            [9, 6, 1, 5, 3, 7, 2, 8, 4],
            [2, 8, 7, 4, 1, 9, 6, 3, 5],
            [3, 4, 5, 2, 8, 6, 1, 7, 9]
        ]
        sudoku.board = solution
        assert sudoku.is_valid_solution() is True

    def test_invalid_solution_duplicates_in_row(self):
        """Test that solution with duplicates in row is invalid"""
        sudoku = Sudoku()
        sudoku.board = [[1] * 9 for _ in range(9)]  # All 1s
        assert sudoku.is_valid_solution() is False

    def test_invalid_solution_incomplete(self):
        """Test that incomplete solution is invalid"""
        sudoku = Sudoku()
        sudoku.board = [[0] * 9 for _ in range(9)]
        assert sudoku.is_valid_solution() is False


class TestSudokuGeneration:
    """Test sudoku puzzle generation"""

    def test_puzzle_generation_creates_board(self):
        """Test that generation creates a non-empty board"""
        sudoku = Sudoku()
        sudoku.generate(difficulty=40)
        
        # Board should not be completely empty
        filled_cells = sum(1 for row in sudoku.board for cell in row if cell != 0)
        assert filled_cells > 0

    def test_puzzle_has_empty_cells(self):
        """Test that generated puzzle has empty cells"""
        sudoku = Sudoku()
        sudoku.generate(difficulty=40)
        
        # Board should have empty cells
        empty_cells = sum(1 for row in sudoku.board for cell in row if cell == 0)
        assert empty_cells > 0

    def test_solution_is_stored(self):
        """Test that solution is stored correctly"""
        sudoku = Sudoku()
        sudoku.generate(difficulty=40)
        
        # Solution should be complete
        assert sudoku.is_complete() is False  # Puzzle has empty cells
        
        # But solution should be complete
        sudoku.board = sudoku.solution
        assert sudoku.is_complete() is True

    def test_puzzle_difficulty_levels(self):
        """Test that different difficulty levels create different puzzles"""
        sudoku_easy = Sudoku()
        sudoku_easy.generate(difficulty=30)
        empty_easy = sum(1 for row in sudoku_easy.board for cell in row if cell == 0)
        
        sudoku_hard = Sudoku()
        sudoku_hard.generate(difficulty=50)
        empty_hard = sum(1 for row in sudoku_hard.board for cell in row if cell == 0)
        
        # Easy should have fewer empty cells than hard
        assert empty_easy < empty_hard


class TestSudokuSerialization:
    """Test sudoku serialization and deserialization"""

    def test_to_dict(self):
        """Test converting sudoku to dictionary"""
        sudoku = Sudoku()
        sudoku.generate(difficulty=40)
        
        data = sudoku.to_dict()
        assert "board" in data
        assert "solution" in data
        assert len(data["board"]) == 9
        assert len(data["board"][0]) == 9

    def test_from_dict(self):
        """Test creating sudoku from dictionary"""
        sudoku1 = Sudoku()
        sudoku1.generate(difficulty=40)
        
        data = sudoku1.to_dict()
        sudoku2 = Sudoku.from_dict(data)
        
        assert sudoku2.board == sudoku1.board
        assert sudoku2.solution == sudoku1.solution


class TestSudokuSolver:
    """Test sudoku solving"""

    def test_solver_on_empty_board(self):
        """Test that solver can fill an empty board"""
        sudoku = Sudoku()
        sudoku.board = [[0] * 9 for _ in range(9)]
        
        # This will create a valid solution
        result = sudoku.solve()
        assert result is True
        assert sudoku.is_complete() is True

    def test_solver_validates_solution(self):
        """Test that solved board is valid"""
        sudoku = Sudoku()
        sudoku.board = [[0] * 9 for _ in range(9)]
        
        sudoku.solve()
        assert sudoku.is_valid_solution() is True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
