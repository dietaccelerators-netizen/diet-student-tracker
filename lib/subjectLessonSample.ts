// Illustrative lesson content supplied by the user. Not published syllabus or saved progress.
export type AccountingBlock =
  | { id: string; kind: 'table' | 'workings'; title: string; columns: string[]; rows: string[][]; numericColumns?: number[]; note?: string }
  | { id: string; kind: 'equation'; title: string; expression: string; explanation?: string }
  | { id: string; kind: 'example' | 'model-answer'; title: string; paragraphs: string[] };

export type LearningContentBlock = {
  heading?: string;
  paragraphs: string[];
  pointsHeading?: string;
  numberedPoints?: {
    title: string;
    description: string;
  }[];
};

export type StudySection = {
  id: string;
  slug: string;
  title: string;
  estimatedMinutes: number;
  completed: boolean;

  overview: string;

  learningObjectives: string[];

  /*
  content = Standard reading mode.
  This is the fuller technical / ICAN-aligned lesson content.

  simplifiedContent = Simplified reading mode.
  This explains the SAME lesson in clearer language.
  It is not a separate note, resource or progress item.
  */
  content: LearningContentBlock;

  simplifiedContent?: LearningContentBlock;

  keyPoints: string[];
  // Shared in both modes: computations and examinable points must not disappear.
  accountingBlocks?: AccountingBlock[];

  workedExamples: {
    id: string;
    title: string;
    scenario: string;
    solution: string[];
  }[];
};


export const sampleLearningTopic = {
  "id": "cgt",
  "slug": "capital-gains-tax",
  "name": "Capital Gains Tax",
  "syllabusWeight": 10,
  "progress": 50,
  "status": "Learning",
  "estimatedMinutes": 150,
  "sections": [
    {
      "id": "cgt-overview",
      "slug": "overview",
      "title": "Overview of CGT",
      "estimatedMinutes": 15,
      "completed": true,
      "overview": "An introduction to Capital Gains Tax, the nature of chargeable gains and the broad framework used in determining taxable gains.",
      "learningObjectives": [
        "Understand the meaning and scope of Capital Gains Tax",
        "Recognise when a chargeable gain may arise",
        "Identify major categories of chargeable assets",
        "Understand how the different CGT sections connect"
      ],
      "content": {
        "heading": "Understanding Capital Gains Tax",
        "paragraphs": [
          "This section introduces the fundamental principles required before moving into the detailed computation of Capital Gains Tax.",
          "The student should understand the nature of a disposal, the identification of chargeable assets and the broad structure of a chargeable gain."
        ]
      },
      "simplifiedContent": {
        "heading": "Capital Gains Tax — Simplified",
        "paragraphs": [
          "Capital Gains Tax applies when a transaction creates a gain that falls within the relevant tax rules.",
          "Before doing any calculation, first identify what asset was involved, whether there was a disposal and whether the resulting gain is chargeable.",
          "Think of this lesson as the foundation for the later CGT sections: identify the transaction first, then determine the correct tax treatment."
        ]
      },
      "keyPoints": [
        "Start by identifying whether the transaction falls within the relevant tax rules.",
        "Always identify the asset and nature of the disposal.",
        "Separate capital transactions from ordinary income transactions."
      ],
      "workedExamples": []
    },
    {
      "id": "cgt-chargeable-assets",
      "slug": "chargeable-assets",
      "title": "Chargeable Assets",
      "estimatedMinutes": 20,
      "completed": true,
      "overview": "Understand which assets may fall within the scope of Capital Gains Tax and how to identify them in examination scenarios.",
      "learningObjectives": [
        "Identify common chargeable assets",
        "Recognise potentially exempt assets",
        "Apply the rules to examination scenarios"
      ],
      "content": {
        "paragraphs": [
          "Before calculating any chargeable gain, determine whether the asset disposed of is within the relevant tax regime."
        ]
      },
      "simplifiedContent": {
        "heading": "Chargeable Assets — Simplified",
        "paragraphs": [
          "Do not start a CGT computation immediately. First ask whether the asset being sold or transferred is one that the rules treat as chargeable.",
          "After identifying the asset, check whether an exemption applies before moving to the gain calculation."
        ]
      },
      "keyPoints": [
        "The nature of the asset should be established first.",
        "Check whether any statutory exemption applies."
      ],
      "workedExamples": []
    },
    {
      "id": "cgt-chargeable-gains",
      "slug": "chargeable-gains",
      "title": "Chargeable Gains",
      "estimatedMinutes": 25,
      "completed": true,
      "overview": "Learn the structure used in arriving at a chargeable gain and the items that may affect the computation.",
      "learningObjectives": [
        "Understand the broad chargeable gain computation",
        "Identify disposal proceeds",
        "Identify relevant deductions"
      ],
      "content": {
        "paragraphs": [
          "A chargeable gain generally begins with the consideration or disposal proceeds and then considers qualifying deductions, reliefs and exemptions."
        ]
      },
      "simplifiedContent": {
        "heading": "Chargeable Gains — Simplified",
        "paragraphs": [
          "A CGT calculation usually starts with what was received from the disposal.",
          "You then consider the costs that are allowed, together with any relevant reliefs or exemptions, to arrive at the chargeable gain.",
          "The safest exam approach is to classify every amount before adding it to or deducting it from the computation."
        ]
      },
      "keyPoints": [
        "Show computations clearly.",
        "Classify each amount before including it."
      ],
      "workedExamples": []
    },
    {
      "id": "cgt-allowable-deductions",
      "slug": "allowable-deductions",
      "title": "Allowable Deductions",
      "estimatedMinutes": 25,
      "completed": false,
      "overview": "This section explains the expenditure that may qualify for deduction when determining a chargeable gain.",
      "learningObjectives": [
        "Identify the major types of allowable expenditure",
        "Understand the conditions for deductibility",
        "Differentiate allowable and non-allowable expenditure",
        "Apply deductions correctly in CGT computations"
      ],
      "content": {
        "heading": "Allowable Deductions",
        "pointsHeading": "Types of allowable deductions",
        "paragraphs": [
          "Allowable deductions are qualifying expenditures that may be taken into account when determining the chargeable gain arising from the disposal of an asset.",
          "The existence of an expense does not automatically mean that the expense is deductible. Each item should be reviewed based on its nature and its relationship to the acquisition, enhancement or disposal of the asset.",
          "When answering an examination question, classify every expenditure item before including it in the computation. This prevents the common mistake of deducting every cost provided in the question."
        ],
        "numberedPoints": [
          {
            "title": "Acquisition expenditure",
            "description": "Qualifying expenditure connected with acquiring the asset may form part of the allowable cost."
          },
          {
            "title": "Enhancement expenditure",
            "description": "Qualifying expenditure incurred to enhance the value of the asset may be relevant where the applicable conditions are satisfied."
          },
          {
            "title": "Incidental acquisition costs",
            "description": "Certain professional and incidental costs connected with acquisition may qualify."
          },
          {
            "title": "Incidental disposal costs",
            "description": "Certain costs directly connected with disposing of the asset may also qualify."
          }
        ]
      },
      "simplifiedContent": {
        "heading": "Allowable Deductions — Simplified",
        "pointsHeading": "Simple breakdown",
        "paragraphs": [
          "Some costs connected with an asset can reduce the gain used for Capital Gains Tax, but not every expense is allowed.",
          "A useful way to think about the rule is to ask what the money was spent on. Costs connected with buying the asset, making a qualifying lasting improvement, or disposing of the asset may be relevant.",
          "Routine running costs, ordinary repairs or unrelated expenses should not automatically be deducted. In an exam question, classify each cost first before deciding whether it belongs in the CGT computation."
        ],
        "numberedPoints": [
          {
            "title": "Cost of acquiring the asset",
            "description": "Start with costs directly connected with buying or acquiring the asset and check whether they qualify."
          },
          {
            "title": "Cost of a lasting improvement",
            "description": "A qualifying improvement that adds value to the asset may be relevant. Ordinary maintenance is different."
          },
          {
            "title": "Professional costs on acquisition",
            "description": "Some professional or incidental costs directly connected with acquiring the asset may qualify."
          },
          {
            "title": "Professional costs on disposal",
            "description": "Some costs directly connected with selling or disposing of the asset may also qualify."
          }
        ]
      },
      "keyPoints": [
        "Do not deduct every expenditure simply because it appears in the question.",
        "The expenditure must satisfy the relevant conditions.",
        "Routine repairs and maintenance should not automatically be treated as capital deductions.",
        "Acquisition and disposal-related professional costs should be reviewed carefully.",
        "Always show the treatment of material expenditure clearly in your workings."
      ],
      "workedExamples": [
        {
          "id": "example-1",
          "title": "Worked Example — Identifying Allowable Costs",
          "scenario": "A company disposes of an investment property. The question provides the original purchase price, legal fees on acquisition, routine maintenance expenditure, improvement expenditure and professional fees incurred on disposal.",
          "solution": [
            "Step 1: Identify the original qualifying acquisition expenditure.",
            "Step 2: Review acquisition-related professional fees.",
            "Step 3: Determine whether the improvement expenditure satisfies the relevant conditions.",
            "Step 4: Exclude routine expenditure that does not qualify.",
            "Step 5: Review professional costs connected with disposal.",
            "Step 6: Total the amounts that satisfy the relevant requirements."
          ]
        }
      ]
    },
    {
      "id": "cgt-reliefs",
      "slug": "reliefs-and-exemptions",
      "title": "Reliefs and Exemptions",
      "estimatedMinutes": 20,
      "completed": false,
      "overview": "Understand the major reliefs and exemptions that may affect Capital Gains Tax.",
      "learningObjectives": [],
      "content": {
        "paragraphs": []
      },
      "keyPoints": [],
      "workedExamples": []
    },
    {
      "id": "cgt-computation",
      "slug": "computation",
      "title": "Computation",
      "estimatedMinutes": 30,
      "completed": false,
      "overview": "Bring the different CGT principles together into a complete computation.",
      "learningObjectives": [],
      "content": {
        "paragraphs": []
      },
      "keyPoints": [],
      "workedExamples": []
    },
    {
      "id": "cgt-filing",
      "slug": "filing-and-payment",
      "title": "Filing and Payment Requirements",
      "estimatedMinutes": 15,
      "completed": false,
      "overview": "Understand the administrative requirements associated with Capital Gains Tax.",
      "learningObjectives": [],
      "content": {
        "paragraphs": []
      },
      "keyPoints": [],
      "workedExamples": []
    }
  ]
};
