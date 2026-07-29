/* ============================================================
   SEED DATA — from "Learning Resources for AI in Science"
   (Schmidt AI in Science Fellowship curated list, Oct 2025)

   Used directly in demo mode; seed-resources.sql (generated
   from this file) loads the same list into the live database.
   demoVotes are SIMULATED numbers so the demo shows how
   background-weighted ranking behaves — they disappear in
   live mode.
   ============================================================ */
window.SEED_RESOURCES = [

  /* ---- Resources developed from the Fellowship ---- */
  {
    title: "Foundation Model for Science Workshop (U Toronto, 2025)",
    languages: ["Python"],
    url: "https://ai-for-science.org/",
    description: "Workshop tutorials on foundation models, taught in the context of protein language models.",
    rtype: "tutorial", category: "Fellowship workshops",
    disciplines: ["Life sciences"], level: "intermediate",
    demoVotes: [ { voter_field: "Life sciences", voter_stage: "Postdoc / researcher", n: 3 } ]
  },
  {
    title: "Symbolic Model Discovery from Time-Series Data (Imperial, 2025)",
    languages: ["Python"],
    url: "https://www.symbolicmodel.org/",
    description: "Lecture recordings and hands-on tutorials on symbolic regression with PySR and PySINDy.",
    rtype: "tutorial", category: "Fellowship workshops",
    disciplines: ["Physical sciences", "Engineering", "Maths & statistics"], level: "intermediate",
    demoVotes: [ { voter_field: "Physical sciences", voter_stage: "Postdoc / researcher", n: 2 } ]
  },
  {
    title: "Knowledge-Guided Machine Learning workshop (U Michigan, 2025)",
    languages: ["Python"],
    url: "https://github.com/MIDAS-KGML",
    description: "Workshop materials on combining scientific knowledge with ML: pre-workshop notebooks and sample data, keynote talks, and tutorials.",
    rtype: "tutorial", category: "Fellowship workshops",
    disciplines: [], level: "intermediate"
  },
  {
    title: "Ten simple rules for navigating AI in science",
    url: "https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1013259",
    description: "PLOS Computational Biology perspective (2025) with practical guidance for using AI responsibly and effectively in research.",
    rtype: "paper", category: "Fellowship workshops",
    disciplines: [], level: "any",
    demoVotes: [ { voter_field: "Life sciences", voter_stage: "PhD / postgrad", n: 2 }, { voter_field: "Social sciences", voter_stage: "Faculty / PI", n: 1 } ]
  },
  {
    title: "RAG Copilot for Scientific Software (UW eScience, 2025)",
    languages: ["Python"],
    url: "https://uw-ssec-tutorials.readthedocs.io/en/latest/AI_Postdoc_Workshop/README.html",
    description: "Tutorial on building an LLM-powered, domain-specific Q&A chatbot with retrieval-augmented generation; includes a video recording.",
    rtype: "tutorial", category: "Fellowship workshops",
    disciplines: [], level: "intermediate"
  },
  {
    title: "EcoViz (UC San Diego, 2024)",
    url: "https://ecoviz.org/",
    description: "A geospatial hub for multidimensional visualisations and data storytelling about ecosystem impacts and nature-based solutions.",
    rtype: "tool", category: "Fellowship workshops",
    disciplines: ["Earth & environment", "Life sciences"], level: "any"
  },

  /* ---- Machine learning: books ---- */
  {
    title: "Pattern Recognition and Machine Learning — C. Bishop",
    url: "https://www.microsoft.com/en-us/research/uploads/prod/2006/01/Bishop-Pattern-Recognition-and-Machine-Learning-2006.pdf",
    description: "Classic introduction to machine learning methods. Aimed at advanced undergraduates, first-year PhD students and researchers; assumes no prior ML knowledge. Free PDF.",
    rtype: "book", category: "Machine learning",
    disciplines: [], level: "intermediate",
    demoVotes: [ { voter_field: "Maths & statistics", voter_stage: "PhD / postgrad", n: 3 }, { voter_field: "Physical sciences", voter_stage: "Postdoc / researcher", n: 2 } ]
  },
  {
    title: "Deep Learning — Goodfellow, Bengio & Courville",
    url: "https://www.deeplearningbook.org/",
    description: "Authored by pioneers in the field and freely available. Probably the best book on deep learning.",
    rtype: "book", category: "Machine learning",
    disciplines: [], level: "advanced",
    demoVotes: [ { voter_field: "Computer science", voter_stage: "PhD / postgrad", n: 4 } ]
  },
  {
    title: "Dive into Deep Learning — A. Zhang et al.",
    languages: ["Python"],
    url: "https://d2l.ai/index.html",
    description: "Free interactive deep learning book with runnable coding tutorials and examples.",
    rtype: "book", category: "Machine learning",
    disciplines: [], level: "intermediate"
  },
  {
    title: "Deep Learning: Foundations and Concepts — Bishop & Bishop",
    url: "https://link.springer.com/book/10.1007/978-3-031-45468-4",
    description: "An exhaustive overview of deep learning. Accessible to beginners but includes material for advanced learners.",
    rtype: "book", category: "Machine learning",
    disciplines: [], level: "any"
  },

  /* ---- Machine learning: courses ---- */
  {
    title: "Supervised Machine Learning: Regression and Classification — Andrew Ng",
    languages: ["Python"],
    url: "https://www.coursera.org/learn/machine-learning",
    description: "A great introduction to supervised machine learning: models are introduced conceptually, then applied in Python.",
    rtype: "course", category: "Machine learning",
    disciplines: [], level: "beginner",
    demoVotes: [ { voter_field: "Life sciences", voter_stage: "PhD / postgrad", n: 3 }, { voter_field: "Engineering", voter_stage: "Master's", n: 2 }, { voter_field: "Medicine & health", voter_stage: "Postdoc / researcher", n: 1 } ]
  },
  {
    title: "Unsupervised Learning, Recommenders, Reinforcement Learning — Andrew Ng",
    languages: ["Python"],
    url: "https://www.coursera.org/learn/unsupervised-learning-recommenders-reinforcement-learning#syllabus",
    description: "Follow-up to Ng's supervised learning course, covering unsupervised models with Python applications.",
    rtype: "course", category: "Machine learning",
    disciplines: [], level: "beginner"
  },
  {
    title: "Deep Learning Specialization — Andrew Ng",
    languages: ["Python"],
    url: "https://www.coursera.org/specializations/deep-learning",
    description: "Five-part specialisation moving from simple neural networks to recurrent architectures, applied in Python.",
    rtype: "course", category: "Machine learning",
    disciplines: [], level: "intermediate",
    demoVotes: [ { voter_field: "Engineering", voter_stage: "Industry / professional", n: 2 } ]
  },
  {
    title: "Practical Deep Learning for Coders — fast.ai",
    languages: ["Python"],
    url: "https://course.fast.ai/",
    description: "Code-first deep learning course with an associated free textbook (\"Deep Learning for Coders with fastai & PyTorch\").",
    rtype: "course", category: "Machine learning",
    disciplines: [], level: "beginner",
    demoVotes: [ { voter_field: "Life sciences", voter_stage: "Postdoc / researcher", n: 2 }, { voter_field: "Computer science", voter_stage: "Undergraduate", n: 1 } ]
  },
  {
    title: "University of Tübingen ML lectures (YouTube)",
    url: "https://www.youtube.com/c/T%C3%BCbingenML",
    description: "Full university lecture series on machine learning topics, freely available on YouTube.",
    rtype: "video", category: "Machine learning",
    disciplines: [], level: "intermediate"
  },

  /* ---- Machine learning: tutorials ---- */
  {
    title: "Distill.pub",
    url: "https://distill.pub/",
    description: "Insightful, beautifully illustrated introductions to topics in deep learning.",
    rtype: "tutorial", category: "Machine learning",
    disciplines: [], level: "intermediate"
  },
  {
    title: "UvA Deep Learning notebooks",
    languages: ["Python"],
    url: "https://uvadlc-notebooks.readthedocs.io/en/latest/tutorial_notebooks/DL2/Bayesian_Neural_Networks/dl2_bnn_tut1_students_with_answers.html",
    description: "University of Amsterdam notebook series — a great hands-on introduction to a broad set of ML topics.",
    rtype: "tutorial", category: "Machine learning",
    disciplines: [], level: "intermediate"
  },

  /* ---- Applied statistics: books ---- */
  {
    title: "Statistical Rethinking — R. McElreath",
    languages: ["R","Python"],
    url: "https://civil.colorado.edu/~balajir/CVEN6833/bayes-resources/RM-StatRethink-Bayes.pdf",
    description: "A great introduction to Bayesian statistics for natural and social scientists, with accompanying online lectures, R and Python code.",
    rtype: "book", category: "Applied statistics",
    disciplines: ["Life sciences", "Social sciences"], level: "intermediate",
    demoVotes: [ { voter_field: "Social sciences", voter_stage: "PhD / postgrad", n: 3 }, { voter_field: "Life sciences", voter_stage: "Faculty / PI", n: 2 } ]
  },
  {
    title: "Bayesian Data Analysis — Gelman et al.",
    languages: ["R","Python","MATLAB"],
    url: "http://www.stat.columbia.edu/~gelman/book/BDA3.pdf",
    description: "Covers a wide range of Bayesian statistics, from single-parameter estimation to non-parametric priors; extensive companion material in R, Python and MATLAB.",
    rtype: "book", category: "Applied statistics",
    disciplines: [], level: "advanced"
  },
  {
    title: "The Elements of Statistical Learning — Hastie, Tibshirani & Friedman",
    url: "https://www.sas.upenn.edu/~fdiebold/NoHesitations/BookAdvanced.pdf",
    description: "A wide-ranging classic across statistics and machine learning, aimed at anyone interested in learning from data.",
    rtype: "book", category: "Applied statistics",
    disciplines: ["Maths & statistics"], level: "advanced"
  },
  {
    title: "A Student's Guide to Bayesian Statistics — B. Lambert",
    languages: ["R"],
    url: "https://ben-lambert.com/a-students-guide-to-bayesian-statistics/",
    description: "An accessible route into Bayesian statistics, from first principles through to applied modelling.",
    rtype: "book", category: "Applied statistics",
    disciplines: [], level: "beginner"
  },

  /* ---- Applied statistics: courses ---- */
  {
    title: "Statistics and Probability — Khan Academy",
    url: "https://www.khanacademy.org/math/statistics-probability",
    description: "An excellent introduction covering a wide range of useful topics, such as hypothesis testing.",
    rtype: "course", category: "Applied statistics",
    disciplines: [], level: "beginner"
  },
  {
    title: "Statistical Rethinking lectures — R. McElreath (YouTube)",
    languages: ["R","Python"],
    url: "https://www.youtube.com/watch?v=FdnMWdICdRs&list=PLDcUM9US4XdPz-KxHM4XHt7uUVGWWVSus",
    description: "Comprehensive, easily accessible lecture course introducing Bayesian statistics; pairs with the book of the same name.",
    rtype: "video", category: "Applied statistics",
    disciplines: [], level: "intermediate"
  },
  {
    title: "Bayesian Statistics Specialization — H. Lee (Coursera)",
    languages: ["R"],
    url: "https://www.coursera.org/learn/bayesian-statistics",
    description: "Five-part specialisation applying Bayesian data analysis in R, from selecting priors to hierarchical models.",
    rtype: "course", category: "Applied statistics",
    disciplines: [], level: "intermediate"
  },

  /* ---- Programming: books ---- */
  {
    title: "Think Python (2nd ed.) — A. Downey",
    languages: ["Python"],
    url: "https://greenteapress.com/thinkpython2/thinkpython2.pdf",
    description: "A great introduction to computing science using Python; assumes zero prior knowledge. Free PDF.",
    rtype: "book", category: "Programming",
    disciplines: [], level: "beginner"
  },
  {
    title: "Machine Learning from Scratch — D. Friedman",
    languages: ["Python"],
    url: "https://dafriedman97.github.io/mlbook/content/introduction.html",
    description: "Teaches Python by deriving ML models mathematically and then implementing them; the whole book is a downloadable Jupyter notebook.",
    rtype: "book", category: "Programming",
    disciplines: [], level: "intermediate"
  },
  {
    title: "Hands-On Programming with R — G. Grolemund",
    languages: ["R"],
    url: "https://rstudio-education.github.io/hopr/",
    description: "A nice introduction to R programming for non-programmers; assumes zero knowledge of R.",
    rtype: "book", category: "Programming",
    disciplines: [], level: "beginner"
  },
  {
    title: "Hands-On Machine Learning with R — Boehmke & Greenwell",
    languages: ["R"],
    url: "https://bradleyboehmke.github.io/HOML/",
    description: "Teaches R by introducing the maths behind ML models and then implementing each in R.",
    rtype: "book", category: "Programming",
    disciplines: [], level: "intermediate"
  },

  /* ---- Programming: courses ---- */
  {
    title: "Applied Software Engineering Fundamentals — R. Ahuja (Coursera)",
    url: "https://www.coursera.org/specializations/software-engineering-fundamentals#courses",
    description: "Five-part specialisation covering shell scripting, Git and Python; assumes zero programming knowledge.",
    rtype: "course", category: "Programming",
    disciplines: [], level: "beginner"
  },
  {
    title: "Crash Course on Python — Google (Coursera)",
    languages: ["Python"],
    url: "https://www.coursera.org/learn/python-crash-course#syllabus",
    description: "Great for those wanting to learn just Python; assumes zero prior programming knowledge.",
    rtype: "course", category: "Programming",
    disciplines: [], level: "beginner",
    demoVotes: [ { voter_field: "Medicine & health", voter_stage: "PhD / postgrad", n: 2 } ]
  },
  {
    title: "Python for Data Science and Machine Learning Bootcamp — J. Portilla (Udemy)",
    languages: ["Python"],
    url: "https://www.udemy.com/course/python-for-data-science-and-machine-learning-bootcamp/",
    description: "Starts from the absolute basics of Python; no prior programming experience assumed.",
    rtype: "course", category: "Programming",
    disciplines: [], level: "beginner"
  },
  {
    title: "Deep Neural Networks with PyTorch — J. Santarcangelo (Coursera)",
    languages: ["Python"],
    url: "https://www.coursera.org/learn/deep-neural-networks-with-pytorch#syllabus",
    description: "Introduces PyTorch by demonstrating how to implement deep learning models.",
    rtype: "course", category: "Programming",
    disciplines: [], level: "intermediate"
  },
  {
    title: "Introduction to TensorFlow for AI, ML, and Deep Learning — L. Moroney (Coursera)",
    languages: ["Python"],
    url: "https://www.coursera.org/learn/introduction-tensorflow#syllabus",
    description: "Introduces TensorFlow by demonstrating how to implement deep learning models.",
    rtype: "course", category: "Programming",
    disciplines: [], level: "intermediate"
  },
  {
    title: "Data Analysis with R Programming — Google (Coursera)",
    languages: ["R"],
    url: "https://www.coursera.org/learn/data-analysis-r",
    description: "Great for those wanting to learn just R; assumes zero prior knowledge.",
    rtype: "course", category: "Programming",
    disciplines: [], level: "beginner"
  },
  {
    title: "Introduction to Big Data with Spark and Hadoop — K. Muthuraman",
    url: null,
    description: "A great course for those interested in learning big-data storage and processing.",
    rtype: "course", category: "Programming",
    disciplines: [], level: "intermediate"
  },
  {
    title: "LinkedIn Learning",
    url: "https://www.linkedin.com/learning/",
    description: "Concise, hands-on introductions to programming tools, plus career-development courses. Imperial College London provides free access.",
    rtype: "other", category: "Programming",
    disciplines: [], level: "beginner"
  },
  {
    title: "Deep Learning Basics — Institut Polytechnique de Paris",
    languages: ["Python"],
    url: "https://github.com/m2dsupsdlclass/lectures-labs",
    description: "Lecture slides and lab notebooks from the Master Year 2 Data Science programme.",
    rtype: "tutorial", category: "Programming",
    disciplines: [], level: "intermediate"
  },
  {
    title: "CS50's Introduction to AI with Python — Harvard",
    languages: ["Python"],
    url: "https://pll.harvard.edu/course/cs50s-introduction-artificial-intelligence-python?delta=0",
    description: "Seven-week introductory course on AI concepts implemented in Python.",
    rtype: "course", category: "Programming",
    disciplines: [], level: "beginner",
    demoVotes: [ { voter_field: "Computer science", voter_stage: "Undergraduate", n: 2 }, { voter_field: "Chemistry & materials", voter_stage: "PhD / postgrad", n: 1 } ]
  },
  {
    title: "6.0001 Introduction to CS and Programming in Python — MIT OCW",
    languages: ["Python"],
    url: "https://ocw.mit.edu/courses/6-0001-introduction-to-computer-science-and-programming-in-python-fall-2016/",
    description: "MIT's classic introductory computer science course, free on OpenCourseWare.",
    rtype: "course", category: "Programming",
    disciplines: [], level: "beginner"
  },

  /* ---- Maths foundations ---- */
  {
    title: "Mathematics for Machine Learning — Deisenroth, Faisal & Ong",
    url: "https://mml-book.github.io/",
    description: "Covers the mathematical foundations of ML and example algorithms that use them. Free PDF.",
    rtype: "book", category: "Maths foundations",
    disciplines: ["Maths & statistics"], level: "intermediate"
  },
  {
    title: "Mathematical Foundations of Machine Learning (Udemy)",
    languages: ["Python"],
    url: "https://www.udemy.com/course/machine-learning-data-science-foundations-masterclass/",
    description: "Online course covering linear algebra and calculus with hands-on lessons in NumPy, TensorFlow and PyTorch.",
    rtype: "course", category: "Maths foundations",
    disciplines: [], level: "beginner"
  },
  {
    title: "Linear Algebra — Gilbert Strang (MIT)",
    url: "https://www.youtube.com/watch?v=ZK3O402wf1c&list=PL49CF3715CB9EF31D&index=1",
    description: "A comprehensive introduction to linear algebra for beginners, from MIT's legendary course.",
    rtype: "video", category: "Maths foundations",
    disciplines: [], level: "beginner"
  },
  {
    title: "Linear Algebra — MathTheBeautiful",
    url: "https://www.youtube.com/playlist?list=PLlXfTHzgMRUKXD88IdzS14F4NxAZudSmv",
    description: "YouTube series on linear algebra for absolute beginners.",
    rtype: "video", category: "Maths foundations",
    disciplines: [], level: "beginner"
  },
  {
    title: "Essence of Linear Algebra — 3Blue1Brown",
    url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab",
    description: "Animated series building conceptual, visual understanding. See also the channel's series on differential equations, calculus, and neural networks (including an intro to transformers).",
    rtype: "video", category: "Maths foundations",
    disciplines: [], level: "beginner",
    demoVotes: [ { voter_field: "Physical sciences", voter_stage: "Undergraduate", n: 2 }, { voter_field: "Engineering", voter_stage: "PhD / postgrad", n: 2 } ]
  },

  /* ---- Optimisation ---- */
  {
    title: "Convex Optimization I & II — S. Boyd (Stanford)",
    url: "https://see.stanford.edu/Course/EE364A",
    description: "Great content throughout — lectures 13–19 of part I and all of part II are underrated. A free online book accompanies the courses (part II at see.stanford.edu/Course/EE364B).",
    rtype: "course", category: "Optimisation",
    disciplines: ["Engineering", "Maths & statistics"], level: "advanced"
  },
  {
    title: "Numerical Optimal Control — Diehl & Gros",
    url: "https://www.syscop.de/files/2017ss/NOC/script/book-NOCSE.pdf",
    description: "A great source on solving optimal-control problems numerically; pairs well with the authors' online course.",
    rtype: "book", category: "Optimisation",
    disciplines: ["Engineering"], level: "advanced"
  },
  {
    title: "Nonlinear and Dynamic Optimization — B. Chachuat",
    url: "https://www.researchgate.net/publication/37452197_Nonlinear_and_Dynamic_Optimization_From_Theory_to_Practice",
    description: "A formal, complete description of dynamic optimisation problems in engineering practice; more mathematically demanding.",
    rtype: "book", category: "Optimisation",
    disciplines: ["Engineering", "Maths & statistics"], level: "advanced"
  },

  /* ---- Information theory ---- */
  {
    title: "Information Theory, Pattern Recognition, and Neural Networks — D. MacKay",
    url: "https://www.youtube.com/watch?v=BCiZc0n6COY&list=PLruBu5BI5n4aFpG32iMbdWoRVAA-Vcso6",
    description: "Classic lecture series using information theory to introduce models and algorithms; based on MacKay's free book.",
    rtype: "video", category: "Information theory",
    disciplines: [], level: "intermediate"
  },

  /* ---- Graph theory ---- */
  {
    title: "Introduction to Graph Theory — R. J. Wilson",
    url: "https://www.maths.ed.ac.uk/~v1ranick/papers/wilsongraph.pdf",
    description: "Comprehensive, easily accessible book introducing all the relevant terms for the practitioner.",
    rtype: "book", category: "Graph theory",
    disciplines: ["Maths & statistics"], level: "beginner"
  },

  /* ---- Computer vision ---- */
  {
    title: "Computer Vision: Algorithms and Applications — R. Szeliski",
    url: "https://szeliski.org/Book/",
    description: "Comprehensive textbook on computer vision, free online.",
    rtype: "book", category: "Computer vision",
    disciplines: ["Computer science", "Engineering"], level: "intermediate"
  },

  /* ---- Signal processing ---- */
  {
    title: "Audio Signal Processing for Machine Learning — V. Velardo",
    languages: ["Python"],
    url: "https://www.youtube.com/playlist?list=PL-wATfeyAMNqIee7cH3q1bh4QJFAaeNv0",
    description: "YouTube series on audio signal processing starting from the basics, with a large companion Slack community.",
    rtype: "video", category: "Signal processing",
    disciplines: ["Engineering"], level: "beginner"
  },

  /* ---- Data visualisation ---- */
  {
    title: "Data-Driven Animation for Science Communication (Coursera)",
    url: "https://www.coursera.org/learn/data-driven-animation",
    description: "From conceptualisation to asset creation, data visualisation, and composition.",
    rtype: "course", category: "Data visualization",
    disciplines: [], level: "beginner"
  },

  /* ---- Institutional resources ---- */
  {
    title: "Schmidt AI in Science Postdoctoral Fellowship",
    url: "https://www.schmidtsciences.org/schmidt-ai-in-science-postdocs/",
    description: "Schmidt Sciences programme applying AI to research in STEM, with partner programmes at Cornell, Imperial, NTU, NUS, UC San Diego, Chicago, Michigan, Oxford and Toronto.",
    rtype: "community", category: "Institutional resources",
    disciplines: [], level: "any"
  },
  {
    title: "Cornell University AI for Science Institute",
    url: "https://science.ai.cornell.edu/",
    description: "Cornell's institute for AI in scientific research.",
    rtype: "community", category: "Institutional resources",
    disciplines: [], level: "any"
  },
  {
    title: "I-X Centre for AI in Science resources (Imperial College London)",
    url: "https://www.imperial.ac.uk/ix-ai-in-science/resources/",
    description: "Resource page of Imperial's I-X Centre; see also the I-X GitHub of fellow-developed material and the centre's YouTube channel of seminars and lectures.",
    rtype: "other", category: "Institutional resources",
    disciplines: [], level: "any"
  },
  {
    title: "Deep Learning with Python — Imperial RCDS course",
    languages: ["Python"],
    url: "https://github.com/ImperialCollegeLondon/RCDS-Deep-Learning-CNN",
    description: "I-X course on deep learning with Python (CNNs), run in collaboration with ECRI.",
    rtype: "course", category: "Institutional resources",
    disciplines: [], level: "intermediate"
  },
  {
    title: "TCAIREM Resource Hub (U Toronto)",
    url: "https://tcairem.utoronto.ca/resource-hub-1",
    description: "Temerty Centre for AI Research and Education in Medicine: curated books & textbooks plus fundamentals & tutorials across data science, deep learning, and healthcare AI.",
    rtype: "other", category: "Institutional resources",
    disciplines: ["Medicine & health"], level: "any"
  },
  {
    title: "U Toronto Map & Data Library — self-paced courses and workshops",
    languages: ["R","Python"],
    url: "https://mdl.library.utoronto.ca/support/self-paced-online-courses",
    description: "Self-paced courses and recorded workshops on data visualisation, infographics, R, Python and Excel.",
    rtype: "course", category: "Institutional resources",
    disciplines: [], level: "beginner"
  },
  {
    title: "Data Science Methods & Statistical Learnings — S. Aref (YouTube)",
    url: "https://www.youtube.com/watch?v=64W_uHRyDnA&list=PLSkGXOii6-CRlwmik1l1h9pG4Uuq0TgeT",
    description: "YouTube lecture series by Professor Samin Aref (U Toronto).",
    rtype: "video", category: "Institutional resources",
    disciplines: [], level: "intermediate"
  },
  {
    title: "Introduction to Big Data (UC San Diego, Coursera)",
    url: "https://www.coursera.org/learn/big-data-introduction",
    description: "Introductory big-data course from UC San Diego.",
    rtype: "course", category: "Institutional resources",
    disciplines: [], level: "beginner"
  }
].map((r, i) => ({
  id: "seed-" + (i + 1),
  suggested_by: null,
  created_at: new Date(Date.UTC(2026, 6, 1, 12, i)).toISOString(),
  ...r
}));
