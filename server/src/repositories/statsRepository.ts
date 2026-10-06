import { query } from '../config/db.js';

export interface CourseStatsDTO {
    courseCode: string;
    completeness: number;
    qualityAvg: number;
    totalResources: number;
    topicCoverage: { topic: string; coverage: number }[];
    activityGrid: number[];
}

export interface TopSlotDTO {
    name: string;
    resources: number;
    score: number;
}

/**
 * Per-course aggregates plus the two repeating groups from the old
 * CourseStats document (topicCoverage[] and activityGrid[]), which are now
 * separate normalized tables.
 */
export const getCourseStats = async (): Promise<CourseStatsDTO[]> => {
    const rows = await query<any>(
        `SELECT c.course_code   AS courseCode,
                cs.completeness AS completeness,
                cs.quality_avg  AS qualityAvg,
                cs.total_resources AS totalResources
           FROM course_stats cs
           JOIN courses c ON c.course_id = cs.course_id
          ORDER BY c.course_code`
    );

    if (rows.length === 0) return [];

    const codes = rows.map(r => r.courseCode);
    const placeholders = codes.map(() => '?').join(',');

    const coverageRows = await query<any>(
        `SELECT c.course_code AS courseCode, t.topic_name AS topic, ctc.coverage AS coverage
           FROM course_topic_coverage ctc
           JOIN courses c ON c.course_id = ctc.course_id
           JOIN topics  t ON t.topic_id  = ctc.topic_id
          WHERE c.course_code IN (${placeholders})
          ORDER BY ctc.coverage DESC`,
        codes
    );

    const activityRows = await query<any>(
        `SELECT c.course_code AS courseCode, ca.activity_date AS activityDate, ca.intensity AS intensity
           FROM course_activity ca
           JOIN courses c ON c.course_id = ca.course_id
          WHERE c.course_code IN (${placeholders})
          ORDER BY c.course_code, ca.activity_date`,
        codes
    );

    const coverageByCourse = new Map<string, { topic: string; coverage: number }[]>();
    for (const row of coverageRows) {
        if (!coverageByCourse.has(row.courseCode)) coverageByCourse.set(row.courseCode, []);
        coverageByCourse.get(row.courseCode)!.push({ topic: row.topic, coverage: Number(row.coverage) });
    }

    const activityByCourse = new Map<string, number[]>();
    for (const row of activityRows) {
        if (!activityByCourse.has(row.courseCode)) activityByCourse.set(row.courseCode, []);
        activityByCourse.get(row.courseCode)!.push(Number(row.intensity));
    }

    return rows.map(r => ({
        courseCode: r.courseCode,
        completeness: Number(r.completeness),
        qualityAvg: Number(r.qualityAvg),
        totalResources: Number(r.totalResources),
        topicCoverage: coverageByCourse.get(r.courseCode) ?? [],
        activityGrid: activityByCourse.get(r.courseCode) ?? []
    }));
};

/** Top 5 slots by number of resources, with the average quality score. */
export const getTopSlots = async (limit = 5): Promise<TopSlotDTO[]> => {
    const rows = await query<any>(
        `SELECT s.slot_code AS name,
                COUNT(*)              AS resources,
                ROUND(AVG(r.quality_score)) AS score
           FROM resources r
           JOIN slots s ON s.slot_id = r.slot_id
          GROUP BY s.slot_id, s.slot_code
          ORDER BY resources DESC, name
          LIMIT ?`,
        [Number(limit)]
    );
    return rows.map(r => ({
        name: r.name,
        resources: Number(r.resources),
        score: Number(r.score)
    }));
};
