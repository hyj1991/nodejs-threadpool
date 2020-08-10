// 任务类，一个任务对应一个id
class Work {
    constructor({workId, filename, options}) {
        this.workId = workId;
        this.filename = filename;
        this.data = null;
        this.error = null;
        this.options = options;
    }
}

exports.Work = Work;