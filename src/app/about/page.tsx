export default function AboutPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 text-3xl font-bold">About Prism</h1>
      <p className="mb-4 text-gray-700">
        Prism is a &quot;human in the loop&quot; web application for data
        analytics. Upload a CSV file and receive an AI-generated interactive
        chart along with an executive summary.
      </p>
      <p className="mb-4 text-gray-700">
        Prism empowers you to stay in control. You can edit the chart type,
        modify the executive summary, and download a shareable report — all
        while leveraging AI to accelerate your analysis.
      </p>
      <p className="text-gray-700">
        Built with Deno, Next.js, Chart.js, and Claude by Anthropic.
      </p>
    </div>
  );
}
