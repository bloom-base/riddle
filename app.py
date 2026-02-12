"""
Flask app for the Sudoku puzzle game.
Provides REST API endpoints for puzzle generation, validation, and game state.
"""

import json
from flask import Flask, render_template, jsonify, request, session
from sudoku import Sudoku

app = Flask(__name__)
app.secret_key = "sudoku-secret-key-change-in-production"


@app.route("/")
def index():
    """Serve the main game page."""
    return render_template("index.html")


@app.route("/api/puzzle", methods=["GET"])
def get_puzzle():
    """
    Generate and return a new sudoku puzzle.
    
    Query parameters:
        difficulty: Number of empty cells (default: 40, range: 30-56)
    """
    difficulty = request.args.get("difficulty", 40, type=int)
    
    # Clamp difficulty to valid range
    difficulty = max(30, min(56, difficulty))
    
    sudoku = Sudoku()
    sudoku.generate(difficulty=difficulty)
    
    # Store the puzzle in the session
    session["puzzle"] = sudoku.to_dict()
    
    return jsonify({
        "board": sudoku.board,
        "difficulty": difficulty,
        "message": "Puzzle generated successfully"
    })


@app.route("/api/validate", methods=["POST"])
def validate_move():
    """
    Validate a move on the sudoku board.
    
    Request body:
        {
            "row": int,
            "col": int,
            "num": int
        }
    """
    data = request.get_json()
    
    if not data or "row" not in data or "col" not in data or "num" not in data:
        return jsonify({"error": "Missing required fields"}), 400
    
    row, col, num = data["row"], data["col"], data["num"]
    
    # Validate input
    if not (0 <= row < 9 and 0 <= col < 9):
        return jsonify({"error": "Invalid row or column"}), 400
    
    if not (0 <= num <= 9):
        return jsonify({"error": "Invalid number"}), 400
    
    # Get puzzle from session
    if "puzzle" not in session:
        return jsonify({"error": "No active puzzle"}), 400
    
    sudoku_data = session["puzzle"]
    sudoku = Sudoku.from_dict(sudoku_data)
    
    # Check if the move is valid
    # For validation, we only check against the ORIGINAL puzzle, not the current state
    # So we need to reconstruct the original board
    original_board = [row_data[:] for row_data in sudoku.board]
    
    # If num is 0 (clear), always allow
    if num == 0:
        return jsonify({"valid": True, "message": "Cell cleared"})
    
    # Otherwise check if it's a valid move
    original_board[row][col] = 0  # Temporarily clear to check
    sudoku.board = original_board
    
    is_valid = sudoku.is_valid(row, col, num)
    
    return jsonify({
        "valid": is_valid,
        "message": "Valid move" if is_valid else "Invalid move - conflicts with existing numbers"
    })


@app.route("/api/check-solution", methods=["POST"])
def check_solution():
    """
    Check if the current board state is a valid solution.
    
    Request body:
        {
            "board": 9x9 array of numbers
        }
    """
    data = request.get_json()
    
    if not data or "board" not in data:
        return jsonify({"error": "Missing board"}), 400
    
    board = data["board"]
    
    # Validate board structure
    if len(board) != 9 or not all(len(row) == 9 for row in board):
        return jsonify({"error": "Invalid board structure"}), 400
    
    sudoku = Sudoku()
    sudoku.board = board
    
    is_complete = sudoku.is_complete()
    is_valid = sudoku.is_valid_solution() if is_complete else False
    
    return jsonify({
        "complete": is_complete,
        "valid": is_valid,
        "message": "Congratulations! Puzzle solved!" if is_valid else (
            "Puzzle incomplete" if not is_complete else "Invalid solution - conflicts detected"
        )
    })


@app.route("/api/hint", methods=["POST"])
def get_hint():
    """
    Get a hint by revealing one cell from the solution.
    
    Request body:
        {
            "board": 9x9 array (current state)
        }
    """
    data = request.get_json()
    
    if not data or "board" not in data:
        return jsonify({"error": "Missing board"}), 400
    
    if "puzzle" not in session:
        return jsonify({"error": "No active puzzle"}), 400
    
    sudoku_data = session["puzzle"]
    sudoku = Sudoku.from_dict(sudoku_data)
    
    board = data["board"]
    
    # Find an empty cell and reveal it from the solution
    for row in range(9):
        for col in range(9):
            if board[row][col] == 0:
                return jsonify({
                    "row": row,
                    "col": col,
                    "value": sudoku.solution[row][col],
                    "message": f"Hint: Cell ({row+1}, {col+1}) is {sudoku.solution[row][col]}"
                })
    
    return jsonify({"error": "No empty cells to hint"}), 400


if __name__ == "__main__":
    app.run(debug=False, host="0.0.0.0", port=5000)
