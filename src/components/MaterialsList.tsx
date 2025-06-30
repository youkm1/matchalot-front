import Link from 'next/link';
import { StudyMaterial } from '../../lib/server-api';
import { getDisplayName } from '@/utils/nickname';


interface Props {
  materials: StudyMaterial[];
}

export default function MaterialsList({ materials }: Props) {
  if (materials.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <div className="text-4xl mb-4">📚</div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          아직 업로드된 학습자료가 없습니다
        </h2>
        <p className="text-gray-600 mb-4">
          첫 번째 족보를 업로드해보세요!
        </p>
        <Link
          href="/upload"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          📤 자료 업로드하기
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {materials.map((material) => (
        <div 
          key={material.id} 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          {/* 자료 정보 */}
          <div className="mb-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
                {material.title}
              </h3>
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full whitespace-nowrap">
                {material.questionCount}문제
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex justify-between">
                <span>과목:</span>
                <span className="font-medium">{material.subject}</span>
              </div>
              <div className="flex justify-between">
                <span>시험:</span>
                <span className="font-medium">{material.examType}</span>
              </div>
              <div className="flex justify-between">
                <span>학기:</span>
                <span className="font-medium">{material.semesterDisplay}</span>
              </div>
            </div>
          </div>

          {/* 업로더 정보 */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">
                {getDisplayName(material.uploaderNickname)}
              </span>
              <span className="text-blue-600 font-medium">
                신뢰도 {material.uploaderTrustScore}
              </span>
            </div>
          </div>

          {/* 태그 */}
          {material.tags && material.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1">
              {material.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index} 
                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
              {material.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{material.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex gap-2">
            <Link
              href={`/materials/${material.id}`}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded text-center text-sm transition-colors"
            >
              자세히 보기
            </Link>
            <Link
              href={`/matches/request/${material.id}`}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-center text-sm transition-colors"
            >
              매칭 요청
            </Link>
          </div>

          {/* 업로드 날짜 */}
          <div className="mt-3 text-xs text-gray-400 text-center">
            {new Date(material.createdAt).toLocaleDateString('ko-KR')}
          </div>
        </div>
      ))}
    </div>
  );
}
