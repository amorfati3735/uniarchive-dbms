export default function handler(req: any, res: any) {
    res.status(200).json({
        status: 'Alive',
        time: new Date().toISOString(),
        message: "Vercel is serving this file correctly."
    });
}
