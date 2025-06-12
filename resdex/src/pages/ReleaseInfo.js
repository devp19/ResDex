import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';


const releaseNotes = {
  v100: {
    title: 'V1.00 | Initial',
    date: 'August 23rd, 2024',
    author: 'Dev Patel',
    description:
      'V1.00 marked the initial project kickoff, establishing the core vision for ResDex and outlining the foundational architecture for future development.',
    tags: ['General Development'],
  },
  v101: {
    title: 'V1.01 | App Configuration',
    date: 'September 10th, 2024',
    author: 'Dev Patel',
    description:
      'V1.01 added support for custom domain configuration, improved error handling across the app, and optimized backend API response times.',
    tags: ['Domain', 'Backend API'],
  },
  v102: {
    title: 'V1.02 | User Development',
    date: 'October 2nd, 2024',
    author: 'Dev Patel',
    description:
      'V1.02 implemented role-based access controls, enhanced PDF viewing performance, and added basic audit logging for user activity.',
    tags: ['PDF Performance', 'Role-Based Access', 'Audit Logging'],
  },
  v103: {
    title: 'V1.03 | Web-Interactivity',
    date: 'November 5th, 2024',
    author: 'Dev Patel',
    description:
      'V1.03 introduced user authentication, file upload functionality, and initial integration with Cloudflare R2 for storage.',
    tags: ['Authentication', 'Upload', 'Cloudflare R2'],
  },
  v200: {
    title: 'V2.00 | S3 Porting',
    date: 'June 5th, 2025',
    author: 'Dev Patel',
    description: `
**V2.00** marked a pivotal shift in both technical infrastructure and team development strategy.

This release introduced structured development workflows, enabling better task ownership, peer collaboration, and improved deployment pipelines. These changes helped reduce bottlenecks and increase velocity across feature development cycles.

A major upgrade in this version was the migration from **AWS S3** to **Cloudflare R2** for object storage. The transition was driven by multiple advantages:

- **Cost Efficiency**: Cloudflare R2 eliminates egress fees, offering significantly lower storage and bandwidth costs compared to AWS S3.
- **Performance Improvements**: With global edge caching and optimized delivery, file access latency was reduced for end users, especially in North America.
- **Simplified Access Control**: R2’s tight integration with Cloudflare’s zero-trust security tools enabled more streamlined permission management and audit logging.
- **Improved Scalability**: R2 offered a flat storage model with increased flexibility, helping prepare ResDex for high-volume uploads and downloads.
- **Vendor Consolidation**: By aligning with Cloudflare’s growing ecosystem, infrastructure became easier to manage and reduced operational complexity.

The release reflects a long-term investment in performance, maintainability, and developer productivity as ResDex continues to expand its feature set and user base.
`,
    tags: ['Team Development', 'AWS S3', 'Cloudflare R2'],
  },
};

const markdownComponents = {
  p: ({ node, ...props }) => <p style={{ color: '#2a2a2a' }} {...props} />,
  strong: ({ node, ...props }) => <strong style={{ color: '#2a2a2a' }} {...props} />,
  li: ({ node, ...props }) => <li style={{ color: '#2a2a2a' }} {...props} />,
  em: ({ node, ...props }) => <em style={{ color: '#2a2a2a' }} {...props} />

};

export default function ReleaseInfo() {
  const { versionId } = useParams();
  const data = releaseNotes[versionId];

  if (!data) {
    return <div className="container pt-5"><h2>Release version not found.</h2></div>;
  }

  return (
    <div className="container pt-5">
      <h1 className="primary">{data.title}</h1>
      <p className="text-muted">{data.date} | Author: {data.author}</p>
      <div className="d-flex flex-wrap mt-3">
        {data.tags.map((tag, i) => (
          <div key={i} className="interest-pill mx-1" style={{ fontSize: '12px' }}>
            {tag}
          </div>
        ))}
      </div>
      <div className="horizontal-line my-3"></div>
 
     <div className='box p-3' style={{ color: '#2a2a2a'  }}>
  <ReactMarkdown components={markdownComponents}>{data.description}</ReactMarkdown>
</div>
      
    </div>
  );
}
