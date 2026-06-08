import { jest } from "@jest/globals";
import mongoose from "mongoose";

jest.unstable_mockModule("../models/Budget.js", () => ({
  default: {
    find: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
  },
}));

jest.unstable_mockModule("../models/Transaction.js", () => ({
  default: {
    transactionModel: {
      aggregate: jest.fn(),
    },
  },
}));

const Budget = (await import("../models/Budget.js")).default;
const TransactionPkg = (await import("../models/Transaction.js")).default;
const BudgetController = (await import("../controllers/budgetController.js"))
  .default;

describe("BudgetController Unit Tests", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      user: { id: new mongoose.Types.ObjectId().toString() },
      body: {},
      params: {},
      query: {},
    };

    res = {
      status: jest.fn().mockReturnThis(), // Allows method chaining: res.status().json()
      json: jest.fn(),
    };

    next = jest.fn();
  });

  describe("getAllBudgets", () => {
    it("should return all budgets sorted by month", async () => {
      const mockBudgets = [{ category: "Food", limit: 500 }];

      Budget.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockBudgets),
      });

      await BudgetController.getAllBudgets(req, res, next);

      expect(Budget.find).toHaveBeenCalledWith({ user: req.user.id });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockBudgets);
    });
  });

  describe("getCurrentMonthBudgets", () => {
    it("should return budgets for the current month", async () => {
      const mockBudgets = [{ category: "Rent", limit: 1000 }];
      Budget.find.mockResolvedValue(mockBudgets);

      await BudgetController.getCurrentMonthBudgets(req, res, next);

      expect(Budget.find).toHaveBeenCalledWith(
        expect.objectContaining({
          user: req.user.id,
          month: expect.any(Object), // Validates that month filter is an object ($gte, $lt)
        }),
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockBudgets);
    });
  });

  describe("insertNewBudget", () => {
    it("should create a new budget and return 201 status", async () => {
      req.body = {
        category: "Groceries",
        limit: 300,
        month: "2023-10",
        prevMonthBudget: false,
      };
      const mockNewBudget = { _id: "1", ...req.body };

      Budget.create.mockResolvedValue(mockNewBudget);

      await BudgetController.insertNewBudget(req, res, next);

      expect(Budget.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockNewBudget);
    });
  });

  describe("updateBudget", () => {
    it("should update a budget if it exists", async () => {
      req.params.id = "budget_id_123";
      req.body = { limit: 600 };
      const mockUpdatedBudget = { _id: req.params.id, limit: 600 };

      Budget.findOneAndUpdate.mockResolvedValue(mockUpdatedBudget);

      await BudgetController.updateBudget(req, res, next);

      expect(Budget.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: req.params.id, user: req.user.id },
        req.body,
        { new: true, runValidators: true },
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedBudget);
    });

    it("should pass a 404 error to next() if budget is not found on update", async () => {
      req.params.id = "budget_id_123";
      Budget.findOneAndUpdate.mockResolvedValue(null);

      await BudgetController.updateBudget(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].statusCode).toBe(404);
      expect(next.mock.calls[0][0].message).toBe("Budget not found");
    });
  });

  describe("deleteBudget", () => {
    it("should delete a budget and return a success message", async () => {
      req.params.id = "budget_id_123";
      Budget.findOneAndDelete.mockResolvedValue({ _id: req.params.id });

      await BudgetController.deleteBudget(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Budget deleted" });
    });

    it("should pass a 404 error to next() if budget is not found on delete", async () => {
      req.params.id = "budget_id_123";
      Budget.findOneAndDelete.mockResolvedValue(null);

      await BudgetController.deleteBudget(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(Error));
      expect(next.mock.calls[0][0].statusCode).toBe(404);
    });
  });

describe("getBudgetReport", () => {
    it("should return a correctly calculated report", async () => {
      req.query.month = "2023-10";

      const mockBudgets = [
        { _id: "b1", category: "Food", limit: 500 },
        { _id: "b2", category: "Transport", limit: 100 },
      ];
      Budget.find.mockResolvedValue(mockBudgets);

      const mockStats = [
        { _id: "Food", totalSpent: -600 }, // Over budget
        { _id: "Transport", totalSpent: -50 }, // Under budget
      ];
      TransactionPkg.transactionModel.aggregate.mockResolvedValue(mockStats);

      await new Promise((resolve) => {
        res.json.mockImplementation(() => resolve());
        
        next.mockImplementation(() => resolve());
        BudgetController.getBudgetReport(req, res, next);
      });

      expect(res.status).toHaveBeenCalledWith(200);

      const responseData = res.json.mock.calls[0][0];
      expect(responseData.report).toHaveLength(2);

      const foodReport = responseData.report.find((r) => r.category === "Food");
      expect(foodReport.spent).toBe(600); // Math.abs conversion
      expect(foodReport.remaining).toBe(-100);
      expect(foodReport.overBudget).toBe(true);

      const transportReport = responseData.report.find(
        (r) => r.category === "Transport"
      );
      expect(transportReport.spent).toBe(50);
      expect(transportReport.remaining).toBe(50);
      expect(transportReport.overBudget).toBe(false);
    });

    it("should pass a 400 error to next() for an invalid date format", async () => {
      req.query.month = "invalid-date";

      await new Promise((resolve) => {
        next.mockImplementation(() => resolve());
        res.json.mockImplementation(() => resolve());
        BudgetController.getBudgetReport(req, res, next);
      });

      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].statusCode).toBe(400);
      expect(next.mock.calls[0][0].message).toBe(
        "Invalid date format use 'YYYY-MM'."
      );
    });
  });

  describe("getBudgetSuggestions", () => {
    it("should return average spending for the last 3 months", async () => {
      const mockSuggestions = [
        { category: "Food", averagePerMonth: 400 },
        { category: "Fun", averagePerMonth: 150 },
      ];
      TransactionPkg.transactionModel.aggregate.mockResolvedValue(
        mockSuggestions,
      );

      await BudgetController.getBudgetSuggestions(req, res, next);

      expect(TransactionPkg.transactionModel.aggregate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockSuggestions);
    });
  });
});