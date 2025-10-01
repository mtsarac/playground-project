// export default function handler(res) {
//   res.status(200).json({ serverTime: new Date().toISOString() });
// }
export async function GET(req: Request) {
  const serverTime = new Date().toISOString();
  return new Response(JSON.stringify({ serverTime }), {
    headers: { "Content-Type": "application/json" },
    status: 200,
    statusText: "OK",
  });
}
