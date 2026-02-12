"""
Sudoku game logic and utilities.
Handles puzzle generation, validation, and solving.
"""

import random
from typing import List, Tuple, Optional


class Sudoku:
    """A Sudoku puzzle and solver."""

    def __init__(self):
        """Initialize an empty sudoku board."""
        self.board = [[0 for _ in range(9)] for _ in range(9)]
        self.solution = [[0 for _ in range(9)] for _ in range(9)]

    def is_valid(self, row: int, col: int, num: int) -> bool:
        """
        Check if placing num at (row, col) is valid.
        
        Args:
            row: Row index (0-8)
            col: Column index (0-8)
            num: Number to check (1-9)
            
        Returns:
            True if the move is valid, False otherwise
        """
        # Check row
        if num in self.board[row]:
            return False

        # Check column
        if num in [self.board[i][col] for i in range(9)]:
            return False

        # Check 3x3 box
        box_row, box_col = 3 * (row // 3), 3 * (col // 3)
        for i in range(box_row, box_row + 3):
            for j in range(box_col, box_col + 3):
                if self.board[i][j] == num:
                    return False

        return True

    def solve(self) -> bool:
        """
        Solve the sudoku using backtracking.
        Modifies self.board in place.
        
        Returns:
            True if solvable, False otherwise
        """
        for row in range(9):
            for col in range(9):
                if self.board[row][col] == 0:
                    for num in range(1, 10):
                        if self.is_valid(row, col, num):
                            self.board[row][col] = num
                            if self.solve():
                                return True
                            self.board[row][col] = 0
                    return False
        return True

    def count_solutions(self, board: Optional[List[List[int]]] = None) -> int:
        """
        Count the number of solutions for the current puzzle.
        Used to ensure puzzles have exactly one solution.
        
        Args:
            board: Board to solve (uses self.board if None)
            
        Returns:
            Number of solutions (0, 1, or 2+)
        """
        if board is None:
            board = [row[:] for row in self.board]

        def count_recursive(b: List[List[int]]) -> int:
            """Count solutions recursively with early termination."""
            for row in range(9):
                for col in range(9):
                    if b[row][col] == 0:
                        count = 0
                        for num in range(1, 10):
                            if self._is_valid_board(b, row, col, num):
                                b[row][col] = num
                                count += count_recursive(b)
                                if count > 1:  # Early termination
                                    b[row][col] = 0
                                    return count
                                b[row][col] = 0
                        return count
            return 1

        return count_recursive(board)

    @staticmethod
    def _is_valid_board(
        board: List[List[int]], row: int, col: int, num: int
    ) -> bool:
        """Check if num is valid at (row, col) on the given board."""
        # Check row
        if num in board[row]:
            return False

        # Check column
        if num in [board[i][col] for i in range(9)]:
            return False

        # Check 3x3 box
        box_row, box_col = 3 * (row // 3), 3 * (col // 3)
        for i in range(box_row, box_row + 3):
            for j in range(box_col, box_col + 3):
                if board[i][j] == num:
                    return False

        return True

    def generate(self, difficulty: int = 40) -> None:
        """
        Generate a new Sudoku puzzle.
        
        Args:
            difficulty: Number of empty cells (higher = harder, typically 40-50)
        """
        # Start with an empty board
        self.board = [[0 for _ in range(9)] for _ in range(9)]

        # Fill the diagonal 3x3 boxes
        for box in range(3):
            nums = list(range(1, 10))
            random.shuffle(nums)
            for i in range(3):
                for j in range(3):
                    self.board[box * 3 + i][box * 3 + j] = nums[i * 3 + j]

        # Fill the rest using backtracking
        self._fill_board()

        # Save the solution
        self.solution = [row[:] for row in self.board]

        # Remove numbers to create puzzle
        cells = [(i, j) for i in range(9) for j in range(9)]
        random.shuffle(cells)

        removed = 0
        for row, col in cells:
            if removed >= difficulty:
                break

            backup = self.board[row][col]
            self.board[row][col] = 0

            # Check if puzzle still has exactly one solution
            if self.count_solutions() == 1:
                removed += 1
            else:
                self.board[row][col] = backup

    def _fill_board(self) -> bool:
        """Fill the board using backtracking."""
        for row in range(9):
            for col in range(9):
                if self.board[row][col] == 0:
                    nums = list(range(1, 10))
                    random.shuffle(nums)
                    for num in nums:
                        if self.is_valid(row, col, num):
                            self.board[row][col] = num
                            if self._fill_board():
                                return True
                            self.board[row][col] = 0
                    return False
        return True

    def is_complete(self) -> bool:
        """Check if the puzzle is completely solved."""
        for row in self.board:
            if 0 in row:
                return False
        return True

    def is_valid_solution(self) -> bool:
        """Check if the current board is a valid complete solution."""
        if not self.is_complete():
            return False

        # Check all rows
        for row in self.board:
            if len(set(row)) != 9 or min(row) < 1 or max(row) > 9:
                return False

        # Check all columns
        for col in range(9):
            column = [self.board[row][col] for row in range(9)]
            if len(set(column)) != 9 or min(column) < 1 or max(column) > 9:
                return False

        # Check all 3x3 boxes
        for box_row in range(0, 9, 3):
            for box_col in range(0, 9, 3):
                box = []
                for i in range(box_row, box_row + 3):
                    for j in range(box_col, box_col + 3):
                        box.append(self.board[i][j])
                if len(set(box)) != 9 or min(box) < 1 or max(box) > 9:
                    return False

        return True

    def to_dict(self) -> dict:
        """Convert board to a dictionary."""
        return {
            "board": self.board,
            "solution": self.solution,
        }

    @staticmethod
    def from_dict(data: dict) -> "Sudoku":
        """Create a Sudoku instance from a dictionary."""
        sudoku = Sudoku()
        sudoku.board = data.get("board", [[0 for _ in range(9)] for _ in range(9)])
        sudoku.solution = data.get("solution", [[0 for _ in range(9)] for _ in range(9)])
        return sudoku
