
import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

export default function MathExplanation(): React.JSX.Element {

  return (
    <div className="bg-white dark:bg-secondary-800 shadow-lg rounded-lg p-6 my-8">
      <h2 className="text-2xl font-semibold mb-6 text-primary-700 dark:text-primary-400 text-center">
        Understanding the Math Behind Zipf's Law Analysis
      </h2>
      
      <div className="space-y-6 text-secondary-700 dark:text-secondary-300">
        <section>
          <h3 className="text-xl font-medium mb-2 text-primary-600 dark:text-primary-500">1. Word Frequency Counting</h3>
          <p>
            The process begins by parsing the uploaded document (text or spreadsheet). For text documents, words are extracted, converted to lowercase, and punctuation is typically removed. Then, the frequency of each unique word is counted.
          </p>
          <p>This results in a list of pairs: (word, actual frequency).</p>
        </section>

        <section>
          <h3 className="text-xl font-medium mb-2 text-primary-600 dark:text-primary-500">2. Zipf's Law</h3>
          <p>
            Zipf's Law is an empirical law which states that given a large sample of words used, the frequency of any word is inversely proportional to its rank in the frequency table. So, the most frequent word will occur approximately twice as often as the second most frequent word, three times as often as the third most frequent word, etc.
          </p>
          <p>
            Mathematically, this can be expressed as:
            <BlockMath math="f \\approx \\frac{C}{r^s}" />
            Where:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><InlineMath math="f" /> is the frequency of a word.</li>
            <li><InlineMath math="r" /> is the rank of the word (1 for the most frequent, 2 for the second most frequent, etc.).</li>
            <li><InlineMath math="C" /> is a constant, specific to the dataset.</li>
            <li><InlineMath math="s" /> is an exponent, typically close to 1 for an ideal Zipfian distribution.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-medium mb-2 text-primary-600 dark:text-primary-500">3. Log-Log Transformation & Linear Regression</h3>
          <p>
            To test how well the data fits Zipf's Law, we can take the logarithm of both sides of the equation (assuming <InlineMath math="s=1" /> for simplicity initially):
            <BlockMath math="\\log(f) \\approx \\log(C) - \\log(r)" />
            Rearranging this gives:
            <BlockMath math="\\log(f) \\approx -1 \\cdot \\log(r) + \\log(C)" />
            This equation is in the form of a straight line, <InlineMath math="y = mx + c" />, where:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li><InlineMath math="y = \\log(f)" /> (logarithm of frequency)</li>
            <li><InlineMath math="x = \\log(r)" /> (logarithm of rank)</li>
            <li><InlineMath math="m = -s" /> (the slope, ideally around -1)</li>
            <li><InlineMath math="c = \\log(C)" /> (the intercept)</li>
          </ul>
          <p>
            The application calculates <InlineMath math="\\log_{10}(\\text{rank})" /> and <InlineMath math="\\log_{10}(\\text{frequency})" /> for each word and then performs linear regression on these log-transformed values to find the actual slope (<InlineMath math="m" />) and intercept (<InlineMath math="c" />) for your data. This is the "Fitted Regression" line on the plot.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-medium mb-2 text-primary-600 dark:text-primary-500">4. Ideal Zipf Line (Slope = -1)</h3>
          <p>
            For comparison, an "Ideal Zipf Line" is also plotted. This line assumes a perfect Zipfian distribution where the exponent <InlineMath math="s=1" />. The constant <InlineMath math="C" /> for this ideal line is typically estimated using the frequency of the most common word (<InlineMath math="f_1" />, where rank <InlineMath math="r=1" />). So, <InlineMath math="C = f_1" />.
          </p>
          <p>The ideal frequency for any rank <InlineMath math="r" /> is then:
            <BlockMath math="f_{\\text{ideal}} = \\frac{f_1}{r}" />
            The log-transformed ideal line is <InlineMath math="\\log(f_{\\text{ideal}}) = \\log(f_1) - \\log(r)" />. This line has a slope of <InlineMath math="-1" /> and passes through the point representing the most frequent word on the log-log plot.
          </p>
        </section>
        
        <section>
          <h3 className="text-xl font-medium mb-2 text-primary-600 dark:text-primary-500">5. R-squared (R²) - Goodness of Fit</h3>
          <p>
            R-squared is a statistical measure of how close the data are to the fitted regression line. It is also known as the coefficient of determination.
            An R² value of 1 indicates that the regression predictions perfectly fit the data. An R² value of 0 indicates that the regression model does not explain any of the variability in the response data around its mean.
          </p>
          <p>
            It's calculated as:
            <BlockMath math="R^2 = 1 - \\frac{SS_{\\text{res}}}{SS_{\\text{tot}}}" />
            Where <InlineMath math="SS_{\\text{res}}" /> is the sum of squared residuals (differences between actual and predicted values from the regression), and <InlineMath math="SS_{\\text{tot}}" /> is the total sum of squares (differences between actual values and their mean).
          </p>
        </section>
        
        <section>
          <h3 className="text-xl font-medium mb-2 text-primary-600 dark:text-primary-500">6. Expected Frequency (Ideal) & Percentage Divergence</h3>
          <p>
            In the detailed table:
          </p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>
              <strong>Expected Frequency (Ideal)</strong>: This is the same as <InlineMath math="f_{\\text{ideal}}" /> described above, calculated as <InlineMath math="\\frac{f_1}{r}" />, where <InlineMath math="f_1" /> is the frequency of the most frequent word. It shows what the frequency of a word at a given rank would be if the dataset perfectly followed Zipf's Law (with <InlineMath math="s=1" /> and <InlineMath math="C=f_1" />).
            </li>
            <li>
              <strong>Percentage Divergence from Expectation</strong>: This measures how much the actual frequency of a word deviates from its "Expected Frequency (Ideal)". It's calculated as:
              <BlockMath math="\\text{Divergence} = \\frac{(\\text{Actual Frequency} - \\text{Expected Frequency})}{\\text{Actual Frequency}} \\times 100\\%" />
              A positive percentage means the actual frequency is higher than the ideal expectation for that rank; a negative percentage means it's lower.
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
