import {
    formatAmount,
    formatMonthLabel,
    categoryClass
} from "../config/familyExpense";

// Summary shown at the top of a family expense sheet: the running total for the
// whole sheet, the figures for the month on screen, and a plain bar breakdown
// per category. The bars are simple divs, no chart library is needed.
function ExpenseSummary({ summary, month }) {
    const categories = Object.entries(summary.categoryTotals || {}).sort(
        (a, b) => b[1] - a[1]
    );

    return (
        <div className="panel-card expense-summary">
            <h2>{formatMonthLabel(month)}</h2>

            <div className="expense-summary-grid">
                <div className="expense-stat">
                    <span className="expense-stat-label">Total Expenses</span>
                    <strong>&#2547;{formatAmount(summary.allTimeTotal)}</strong>
                </div>

                <div className="expense-stat">
                    <span className="expense-stat-label">Number of Expenses</span>
                    <strong>{summary.allTimeCount}</strong>
                </div>

                <div className="expense-stat">
                    <span className="expense-stat-label">This Month</span>
                    <strong>&#2547;{formatAmount(summary.monthTotal)}</strong>
                </div>

                <div className="expense-stat">
                    <span className="expense-stat-label">Entries This Month</span>
                    <strong>{summary.monthCount}</strong>
                </div>
            </div>

            {categories.length > 0 && (
                <div className="category-breakdown">
                    <h3>Category Breakdown</h3>

                    {categories.map(([category, total]) => (
                        <div key={category} className="category-row">
                            <span className="category-row-name">{category}</span>

                            <span className="category-bar">
                                <span
                                    className={`category-bar-fill cat-${categoryClass(
                                        category
                                    )}`}
                                    style={{
                                        width: `${
                                            summary.monthTotal > 0
                                                ? (total / summary.monthTotal) * 100
                                                : 0
                                        }%`
                                    }}
                                />
                            </span>

                            <span className="category-row-amount">
                                &#2547;{formatAmount(total)}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ExpenseSummary;
