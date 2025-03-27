import random
import numpy as np
import matplotlib.pyplot as plt

def simulate_yield_distribution(
    num_policies=1000,
    annual_premium=3000,
    claim_amount=150000,
    simulations=10_000,
    p_min=0.003,  # 0.3%
    p_max=0.017   # 1.7%
):
    """
    Monte Carlo simulation of yield distribution. In each simulation, we draw a random 
    fire probability p ~ Uniform(p_min, p_max), determine how many fires occur out of 'num_policies', 
    and compute the annual yield (net profit / total premiums * 100).
    """
    total_premiums = num_policies * annual_premium
    yields = []

    for _ in range(simulations):
        # 1. Draw a random probability of fire
        p = random.uniform(p_min, p_max)
        
        # 2. Determine how many policies experience a fire
        fires = sum(1 for _ in range(num_policies) if random.random() < p)
        
        # 3. Compute net profit for the year
        total_payout = fires * claim_amount
        net_profit = total_premiums - total_payout
        
        # 4. Calculate yield as a percentage of total premiums
        yield_percentage = (net_profit / total_premiums) * 100
        yields.append(yield_percentage)

    return yields

def summarize_and_plot_yields(yields):
    """
    Prints descriptive statistics and plots a histogram of yields with vertical lines for 
    the mean, 5th percentile, and 95th percentile.
    """
    yields_np = np.array(yields)
    mean_yield = np.mean(yields_np)
    p5 = np.percentile(yields_np, 5)
    p95 = np.percentile(yields_np, 95)

    print(f"Mean Yield: {mean_yield:.2f}%")
    print(f"5th Percentile: {p5:.2f}%")
    print(f"95th Percentile: {p95:.2f}%")

    # Plot the distribution
    plt.figure(figsize=(9,5))
    plt.hist(yields_np, bins=50, edgecolor='black')
    plt.axvline(mean_yield, linestyle='--', label=f"Mean: {mean_yield:.2f}%")
    plt.axvline(p5, linestyle='-.', label=f"5th Pctl: {p5:.2f}%")
    plt.axvline(p95, linestyle='--', label=f"95th Pctl: {p95:.2f}%")
    plt.title("Monte Carlo Simulation: Yield Distribution with Random Fire Probability")
    plt.xlabel("Yield (%)")
    plt.ylabel("Frequency")
    plt.legend()
    plt.grid(True)
    plt.show()

if __name__ == "__main__":
    # Run the simulation
    yields = simulate_yield_distribution()
    # Summarize results and plot
    summarize_and_plot_yields(yields)
