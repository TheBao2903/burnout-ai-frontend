import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AlertCircle, ArrowDownRight, ArrowUpRight, Loader2, Minus, RefreshCw, TrendingUp } from 'lucide-react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { dashboardService, type OlbiHistoryPoint, type OlbiProgressData } from '../../services/dashboard';
import { useAuth } from '../../contexts/AuthContext';

const dimensions = [
  { key: 'exhaustion', label: 'Cạn kiệt năng lượng', color: '#d97706' },
  { key: 'disengagement', label: 'Mất gắn kết', color: '#7c3aed' },
] as const;

const formatDate = (value: string | number, withTime = false) => new Date(value).toLocaleString('vi-VN', {
  timeZone: 'Asia/Bangkok', day: '2-digit', month: '2-digit', year: 'numeric',
  ...(withTime ? { hour: '2-digit', minute: '2-digit' } as const : {}),
});

function Change({ value }: { value: number | null }) {
  if (value === null) return <span className="text-gray-500">Chưa có lần so sánh</span>;
  const Icon = value < 0 ? ArrowDownRight : value > 0 ? ArrowUpRight : Minus;
  return <span className={`inline-flex items-center gap-1 font-medium ${value < 0 ? 'text-emerald-700' : value > 0 ? 'text-orange-700' : 'text-gray-600'}`}>
    <Icon className="h-4 w-4" aria-hidden="true" />
    {value === 0 ? 'Không đổi' : `${value < 0 ? 'Giảm' : 'Tăng'} ${Math.abs(value).toFixed(2)} điểm`}
  </span>;
}

export default function OlbiProgress({ startDate, endDate }: { startDate: string; endDate: string }) {
  const { user, isAuthReady } = useAuth();
  const owner = user?.uid || user?.id || '';
  const { hash } = useLocation();
  const section = useRef<HTMLElement>(null);
  const range = `${startDate}_${endDate}`;
  const [revision, setRevision] = useState(0);
  const [response, setResponse] = useState<{ owner: string; range: string; data: OlbiProgressData } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthReady || !owner) return;
    const controller = new AbortController();
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await dashboardService.getOlbiHistory({ start_date: startDate, end_date: endDate }, controller.signal);
        if (!controller.signal.aborted) setResponse({ owner, range, data });
      } catch {
        if (!controller.signal.aborted) setError('Không tải được lịch sử OLBI. Bạn có thể thử lại.');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };
    void fetch();
    return () => controller.abort();
  }, [owner, isAuthReady, range, startDate, endDate, revision]);

  useEffect(() => {
    if (hash !== '#olbi-progress') return;
    const frame = requestAnimationFrame(() => {
      section.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      section.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [hash]);

  const data = response?.owner === owner && response.range === range ? response.data : null;
  const selected = data?.points.find(point => point.id === selectedId) || data?.points.at(-1);
  const points = data?.points || [];
  const domain: [number | 'dataMin', number | 'dataMax'] = points.length === 1
    ? [points[0].timestamp - 43200000, points[0].timestamp + 43200000] : ['dataMin', 'dataMax'];

  const renderDot = (props: unknown, color: string) => {
    const { cx, cy, payload } = props as { cx?: number; cy?: number; payload?: OlbiHistoryPoint };
    if (!payload) return <circle r={0} />;
    return <circle key={`${color}-${payload.id}`} cx={cx} cy={cy} r={selected?.id === payload.id ? 6 : 4}
      fill={color} stroke="white" strokeWidth={2} tabIndex={0} role="button"
      aria-label={`Xem lần ${payload.sequence}, ${formatDate(payload.completed_at, true)}`}
      className="cursor-pointer outline-offset-4"
      onClick={() => setSelectedId(payload.id)} onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedId(payload.id); }
      }} />;
  };

  return <section id="olbi-progress" ref={section} tabIndex={-1} aria-labelledby="olbi-progress-title"
    className="scroll-mt-6 rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm sm:p-6">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h2 id="olbi-progress-title" className="flex items-center gap-2 text-lg font-bold text-gray-900">
          <TrendingUp className="h-5 w-5 text-indigo-600" /> Tiến triển OLBI định kỳ
        </h2>
        <p className="mt-1 text-sm text-gray-600">16 câu · Thang 1–4 sau đảo điểm · Điểm thấp hơn thể hiện ít tín hiệu cạn kiệt hoặc mất gắn kết hơn.</p>
        <p className="mt-1 text-xs text-gray-500">Dùng bộ lọc thời gian chung của dashboard. OLBI thang 1–4, tách riêng với check-in hằng ngày thang 1–5.</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-600">{formatDate(startDate)} – {formatDate(endDate)}</span>
        <button type="button" onClick={() => setRevision(value => value + 1)} disabled={loading}
          aria-label="Tải lại lịch sử OLBI" className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>

    {loading || (!data && !error) ? <div className="flex h-48 items-center justify-center gap-2 text-gray-500" role="status"><Loader2 className="h-5 w-5 animate-spin" /> Đang tải lịch sử OLBI...</div>
      : error ? <div role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800">
        <p className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</p>
        <button type="button" onClick={() => setRevision(value => value + 1)} className="mt-2 font-semibold underline">Thử lại</button>
      </div> : data && <>
        {data.visible_records === 0 ? <div className="mt-5 rounded-xl bg-indigo-50 p-6 text-center">
          <p className="font-semibold text-gray-800">Không có đánh giá OLBI định kỳ trong khoảng đã chọn</p>
          <p className="mt-2 text-sm text-gray-600">Bạn có thể đổi khoảng ngày ở bộ lọc chung phía trên hoặc thực hiện bài OLBI 16 câu.</p>
          <Link to="/survey-test?mode=olbi16" className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Làm bài OLBI 16 câu</Link>
        </div> : <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {dimensions.map(({ key, label, color }) => {
              const comparison = data.comparisons[key];
              return <div key={key} className="rounded-xl border border-gray-200 p-4">
                <h3 className="text-sm font-semibold" style={{ color }}>{label}</h3>
                <p className="mt-2 text-2xl font-bold text-gray-900">{comparison.latest?.toFixed(2)}<span className="text-sm font-normal text-gray-500"> /4 cuối khoảng</span></p>
                <p className="mt-2 text-sm"><Change value={comparison.change_from_baseline} /> <span className="text-gray-500">so với lần đầu trong khoảng</span></p>
                <p className="mt-1 text-xs"><Change value={comparison.change_from_previous} /> <span className="text-gray-500">so với lần trước trong khoảng</span></p>
                <p className="mt-2 text-xs text-gray-500">Lần đầu trong khoảng: {comparison.baseline?.toFixed(2)}/4 · {data.baseline_at && formatDate(data.baseline_at)}</p>
              <p className="mt-1 text-xs text-gray-500">Lần cuối: {data.latest_at && formatDate(data.latest_at)}</p>
              </div>;
            })}
          </div>
          <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-gray-700" aria-live="polite">
            <p>{data.summary}</p>
            {data.direction === 'mixed' && <p className="mt-1">Hai chiều thay đổi khác hướng; hãy xem riêng từng chỉ số.</p>}
            <p className="mt-2 text-xs text-gray-500">Biểu đồ và các thẻ so sánh đều dùng các lần OLBI hợp lệ trong khoảng ngày đã chọn. Thay đổi điểm không khẳng định đã hồi phục hoặc chứng minh hiệu quả của một biện pháp.</p>
          </div>

          {<>
            <p className="mt-5 text-xs text-gray-500">Có {data.visible_records} lần đánh giá trong khoảng đã chọn. Bấm vào điểm để xem lần tương ứng. Đường nối không đại diện cho các ngày chưa đo.</p>
            {points.length === 1 && <p className="mt-2 text-sm text-indigo-700">Khoảng này có một lần đánh giá; chưa đủ để vẽ diễn biến giữa các lần.</p>}
            <div className="mt-4 h-72 w-full" role="img" aria-label="Biểu đồ hai chiều OLBI theo ngày thực hiện. Số liệu chi tiết có trong bảng bên dưới.">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={points} margin={{ top: 15, right: 20, left: -15, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="timestamp" type="number" scale="time" domain={domain}
                    tickFormatter={value => formatDate(value)} minTickGap={45} tick={{ fontSize: 11 }} />
                  <YAxis domain={[1, 4]} ticks={[1, 2, 3, 4]} tick={{ fontSize: 12 }} allowDataOverflow />
                  <Tooltip labelFormatter={value => formatDate(Number(value), true)} formatter={(value: number | string, name: string) => [`${Number(value).toFixed(2)}/4`, name]} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                  {dimensions.map(({ key, label, color }) => <Line key={key} type="linear" dataKey={key} name={label}
                    stroke={color} strokeWidth={2.5} strokeDasharray={key === 'disengagement' ? '6 4' : undefined} isAnimationActive={false}
                    dot={(props: unknown) => renderDot(props, color)} activeDot={(props: unknown) => renderDot(props, color)} />)}
                </LineChart>
              </ResponsiveContainer>
            </div>
            {selected && <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-indigo-50 p-4 text-sm">
              <div><p className="font-semibold text-indigo-900">Lần {selected.sequence} · {formatDate(selected.completed_at, true)}</p>
                <p className="mt-1 text-indigo-800">Cạn kiệt: {selected.exhaustion.toFixed(2)}/4 · Mất gắn kết: {selected.disengagement.toFixed(2)}/4</p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                  {dimensions.map(({ key, label }) => <p key={key}>{label}: <Change value={selected.change_from_previous[key]} /> so với lần trước</p>)}
                </div>
              </div>
              <Link to={`/survey-test?survey_id=${encodeURIComponent(selected.id)}`} className="font-semibold text-indigo-700 underline">Xem câu trả lời lần này</Link>
            </div>}
            <details className="mt-4 rounded-xl border border-gray-200 p-3">
              <summary className="cursor-pointer text-sm font-semibold text-gray-700">Bảng số liệu từng lần đánh giá ({points.length})</summary>
              <div className="mt-3 max-h-80 overflow-auto">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">Các lần OLBI trong khoảng đang xem, thang điểm 1–4</caption>
                  <thead><tr className="border-b text-xs text-gray-500"><th scope="col" className="p-2">Lần / ngày</th><th scope="col" className="p-2">Cạn kiệt</th><th scope="col" className="p-2">Mất gắn kết</th><th scope="col" className="p-2">Chi tiết</th></tr></thead>
                  <tbody>{[...points].reverse().map(point => <tr key={point.id} className="border-b last:border-0">
                    <th scope="row" className="p-2 font-normal">#{point.sequence} · {formatDate(point.completed_at, true)}</th>
                    <td className="p-2">{point.exhaustion.toFixed(2)}/4</td><td className="p-2">{point.disengagement.toFixed(2)}/4</td>
                    <td className="p-2"><Link to={`/survey-test?survey_id=${encodeURIComponent(point.id)}`} className="text-indigo-700 underline" aria-label={`Xem câu trả lời OLBI lần ${point.sequence}`}>Xem</Link></td>
                  </tr>)}</tbody>
                </table>
              </div>
            </details>
          </>}
        </>}
        {data.excluded_records > 0 && <p className="mt-4 text-xs text-amber-800">Có {data.excluded_records} bản ghi OLBI chưa đủ dữ liệu hoặc khác phiên bản chấm điểm, không đưa vào so sánh.</p>}
        <p className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-500">OLBI phản ánh cạn kiệt năng lượng và mất gắn kết trong công việc; không đo trực tiếp mọi trạng thái cảm xúc. Chỉ hiển thị bài 16 câu có phiên bản và điểm lưu hợp lệ; dữ liệu cũ thiếu thông tin không được tự quy đổi.</p>
      </>}
  </section>;
}
